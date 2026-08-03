import NextcloudClient from '../source/client';
import configuration   from './configuration';
import { execSync }    from 'child_process';

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Groupfolders integration', function testGroupfoldersIntegration() {
  const client = new NextcloudClient(configuration.connectionOptions);

  beforeAll(async () => {
    execSync(
      'docker exec -u 33 nextcloud-link-nextcloud-1 php occ app:install groupfolders'
    );
    execSync(
      'docker exec -u 33 nextcloud-link-nextcloud-1 php occ app:enable groupfolders'
    );

    await sleep(2000);
  }, 30000);

  describe('getFolders() and getFolder(fid)', () => {
    afterAll(() => {
      execSync(`docker exec -u 33 nextcloud-link-nextcloud-1 bash -c 'php occ groupfolders:delete 1 -f'`);
      execSync(`docker exec -u 33 nextcloud-link-nextcloud-1 bash -c 'php occ groupfolders:delete 2 -f'`);
    })

    it('should return an empty array if there are no groupfolders', async () => {
      expect(await client.groupfolders.getFolders()).toEqual([]);
    });

    it('should return an array with existing groupfolder', async () => {
      try {
        execSync(`docker exec -u 33 nextcloud-link-nextcloud-1 bash -c 'php occ groupfolders:create testing'`);
        await sleep(1000);
      } catch (error) {
        // console.error(error);
      }

      const groupfolders = await client.groupfolders.getFolders();

      expect(groupfolders).toEqual([
        {
          acl: false,
          groups: [],
          id: 1,
          manage: [],
          mountPoint: 'testing',
          quota: -3,
          size: 0,
        }
      ]);
    });

    it('should return an array with existing groupfolders', async () => {
      execSync(`docker exec -u 33 nextcloud-link-nextcloud-1 bash -c 'php occ groupfolders:create another'`);
      await sleep(1000);

      const groupfolders = await client.groupfolders.getFolders();

      expect(groupfolders).toEqual([
        {
          id: 1,
          acl: false,
          groups: [],
          manage: [],
          mountPoint: 'testing',
          quota: -3,
          size: 0,
        },
        {
          id: 2,
          acl: false,
          groups: [],
          manage: [],
          mountPoint: 'another',
          quota: -3,
          size: 0,
        },
      ]);
    });

    it('should return existing groupfolder', async () => {
      const groupfolder = await client.groupfolders.getFolder(1);

      expect(groupfolder).toEqual({
        acl: false,
        groups: [],
        id: 1,
        manage: [],
        mountPoint: 'testing',
        quota: -3,
        size: 0,
      });
    });

    it('should throw an error if the requested groupfolder does not exist', async () => {
      await expect(client.groupfolders.getFolder(999))
      .rejects
      .toThrowError(/Unable to get groupfolder '999': Not Found/);
    });
  });

  describe('addFolder(mountpoint)', () => {
    it('should add new groupfolder and return its id', async () => {
      const mountpoint = 'some name';
      const groupfolderId = await client.groupfolders.addFolder(mountpoint);

      expect(groupfolderId).toBe(3);
    });
  });

  describe('removeFolder(fid)', () => {
    //! this test suite is dependent on the previous one, as it needs an existing groupfolder to test the removal
    it('should remove existing groupfolder and return true', async () => {
      expect(await client.groupfolders.getFolder(3)).toBeDefined();

      expect(await client.groupfolders.removeFolder(3)).toBe(true);

      await expect(client.groupfolders.getFolder(3))
      .rejects
      .toThrowError(/Unable to get groupfolder '3': Not Found/);
    });

    it('should throw an error if the groupfolder does not exist', async () => {
      await expect(client.groupfolders.removeFolder(999))
      .rejects
      .toThrowError(/Unable to delete groupfolder '999': Not Found/);
    });
  });

  describe('addGroup(fid, gid), removeGroup(fid, gid), setPermissions(fid, gid, permissions)', () => {
    let groupfolderId: number;
    const group = 'admin';

    beforeAll(async () => {
      try {
        execSync(`docker exec -u 33 nextcloud-link-nextcloud-1 bash -c 'php occ groupfolders:create testing'`);
        await sleep(1000);
      } catch (error) {
        // console.error(error);
      }

      groupfolderId = (await client.groupfolders.getFolders())?.[0]?.id;
    });

    it('should add group to existing groupfolder', async () => {
      const groupfolder = await client.groupfolders.getFolder(groupfolderId);
      expect(groupfolder.groups).toEqual([]);

      expect(await client.groupfolders.addGroup(groupfolderId, group)).toBe(true);

      const groupfolderAfter = await client.groupfolders.getFolder(groupfolderId);
      expect(groupfolderAfter.groups).toEqual({ [group]: 31 });
    });

    it('should throw an error when the same group is added repeatedly', async () => {
      await expect(client.groupfolders.addGroup(groupfolderId, group)).rejects.toBeDefined();
    });

    it('should throw an error when adding group to non-existing groupfolder', async () => {
      await expect(client.groupfolders.addGroup(groupfolderId + 100, group))
      .rejects
      .toThrowError(new RegExp(`Unable to add group to groupfolder '${groupfolderId + 100}': Not Found`));
    });

    it('should set group permissions on existing groupfolder', async () => {
      expect(await client.groupfolders.setPermissions(groupfolderId, group, 1)).toBe(true);

      expect(await client.groupfolders.getFolder(groupfolderId)).toMatchObject({ groups: { [group]: 1 } });

      expect(await client.groupfolders.setPermissions(groupfolderId, group, 0)).toBe(true);

      expect(await client.groupfolders.getFolder(groupfolderId)).toMatchObject({ groups: { [group]: 0 } });
    });

    it('should throw an error when setting group permissions on non-existing groupfolder', async () => {
      await expect(client.groupfolders.setPermissions(groupfolderId + 100, group, 1))
      .rejects
      .toThrowError(new RegExp(`Unable to set groupfolder permissions '${groupfolderId + 100}': Not Found`));
    });

    it('should remove group from existing groupfolder', async () => {
      expect(await client.groupfolders.removeGroup(groupfolderId, group)).toBe(true);

      const groupfolderAfter = await client.groupfolders.getFolder(groupfolderId);
      expect(groupfolderAfter.groups).toEqual([]);
    });
  });

  describe('enableACL(fid, enable)', () => {
    let groupfolderId: number;

    beforeAll(async () => {
      try {
        execSync(`docker exec -u 33 nextcloud-link-nextcloud-1 bash -c 'php occ groupfolders:create testing'`);
        await sleep(1000);
      } catch (error) {
        // console.error(error);
      }

      groupfolderId = (await client.groupfolders.getFolders())?.[0]?.id;
    });

    it('should enable ACL on existing groupfolder', async () => {
      expect(await client.groupfolders.enableACL(groupfolderId, true)).toBe(true);

      expect(await client.groupfolders.getFolder(groupfolderId)).toMatchObject({ acl: true });
    });

    it('should disable ACL on existing groupfolder', async () => {
      expect(await client.groupfolders.enableACL(groupfolderId, false)).toBe(true);

      expect(await client.groupfolders.getFolder(groupfolderId)).toMatchObject({ acl: false });
    });

    it('should throw an error when enabling ACL on non-existing groupfolder', async () => {
      await expect(client.groupfolders.enableACL(groupfolderId + 100, true))
      .rejects
      .toThrowError(new RegExp(`Unable to enable ACL for groupfolder '${groupfolderId + 100}': Not Found`));
    });
  });

  describe('setManageACL(fid, type, id, manageACL)', () => {
    let groupfolderId: number;

    beforeAll(async () => {
      try {
        execSync(`docker exec -u 33 nextcloud-link-nextcloud-1 bash -c 'php occ groupfolders:create testing'`);
        await sleep(1000);
      } catch (error) {
        // console.error(error);
      }

      groupfolderId = (await client.groupfolders.getFolders())?.[0]?.id;
    });

    it('should enable managing ACL for a "admin" group on existing groupfolder', async () => {
      expect((await client.groupfolders.getFolders())?.[0]).toMatchObject({ manage: [] });

      expect(await client.groupfolders.setManageACL(groupfolderId, 'group', 'admin', true)).toBe(true);

      expect((await client.groupfolders.getFolders())?.[0]).toMatchObject({ manage: [{
        displayname: 'admin',
        id: 'admin',
        type: 'group',
      }] });
    });

    it('should disable managing ACL for a "admin" group on existing groupfolder', async () => {
      expect(await client.groupfolders.setManageACL(groupfolderId, 'group', 'admin', false)).toBe(true);

      expect((await client.groupfolders.getFolders())?.[0]).toMatchObject({ manage: [] });
    });

    it('should only enable managing ACL for existing users', async () => {
      expect((await client.groupfolders.getFolders())?.[0]).toMatchObject({ manage: [] });

      expect(await client.groupfolders.setManageACL(groupfolderId, 'user', 'nextcloud', true)).toBe(true);

      expect((await client.groupfolders.getFolders())?.[0]).toMatchObject({ manage: [{
        displayname: 'nextcloud',
        id: 'nextcloud',
        type: 'user',
      }] });
    });
  });

  describe('setQuota(fid, quota)', () => {
    let groupfolderId: number;

    beforeAll(async () => {
      try {
        execSync(`docker exec -u 33 nextcloud-link-nextcloud-1 bash -c 'php occ groupfolders:create testing'`);
        await sleep(1000);
      } catch (error) {
        // console.error(error);
      }

      groupfolderId = (await client.groupfolders.getFolders())?.[0]?.id;
    });

    it('should set quota on existing groupfolder', async () => {
      expect(await client.groupfolders.setQuota(groupfolderId, 1000)).toBe(true);

      expect(await client.groupfolders.getFolder(groupfolderId)).toMatchObject({ quota: 1000 });
    });

    it('should set quota on existing groupfolder', async () => {
      expect(await client.groupfolders.setQuota(groupfolderId, -3)).toBe(true);

      expect(await client.groupfolders.getFolder(groupfolderId)).toMatchObject({ quota: -3 });
    });

    it('should throw an error when setting quota on non-existing groupfolder', async () => {
      await expect(client.groupfolders.setQuota(groupfolderId + 100, 1000))
      .rejects
      .toThrowError(new RegExp(`Unable to set groupfolder quota '${groupfolderId + 100}': Not Found`));
    });
  });

  describe('renameFolder(fid, mountpoint)', () => {
    let groupfolderId: number;

    beforeAll(async () => {
      try {
        execSync(`docker exec -u 33 nextcloud-link-nextcloud-1 bash -c 'php occ groupfolders:create testing'`);
        await sleep(1000);
      } catch (error) {
        // console.error(error);
      }

      groupfolderId = (await client.groupfolders.getFolders())?.[0]?.id;
    });

    it('should rename existing groupfolder', async () => {
      expect(await client.groupfolders.renameFolder(groupfolderId, 'new name')).toBe(true);

      expect(await client.groupfolders.getFolder(groupfolderId)).toMatchObject({ mountPoint: 'new name' });
    });

    it('should throw an error when renaming non-existing groupfolder', async () => {
      await expect(client.groupfolders.renameFolder(groupfolderId + 100, 'new name'))
      .rejects
      .toThrowError(new RegExp(`Unable to rename groupfolder '${groupfolderId + 100}': Not Found`));
    });
  });
});
