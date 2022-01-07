import NextcloudClient from '../source/client';
import configuration   from './configuration';
import { execSync }    from 'child_process';

describe('Groupfolders integration', function testGroupfoldersIntegration() {
  const client = new NextcloudClient(configuration.connectionOptions);

  beforeAll(() => {
    execSync(`docker exec -u 33 nextcloud-link_nextcloud_1 bash -c 'php occ app:install groupfolders'`);
    execSync(`docker exec -u 33 nextcloud-link_nextcloud_1 bash -c 'php occ app:enable groupfolders'`);
  });

  describe('getFolders() and getFolder(fid)', () => {
    afterAll(() => {
      execSync(`docker exec -u 33 nextcloud-link_nextcloud_1 bash -c 'php occ groupfolders:delete 1 -f'`);
      execSync(`docker exec -u 33 nextcloud-link_nextcloud_1 bash -c 'php occ groupfolders:delete 2 -f'`);
    })

    it('should return an empty array if there are no groupfolders', async () => {
      expect(await client.groupfolders.getFolders()).toEqual([]);
    });

    it('should return an array with existing groupfolder', async () => {
      execSync(`docker exec -u 33 nextcloud-link_nextcloud_1 bash -c 'php occ groupfolders:create testing'`);

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
      execSync(`docker exec -u 33 nextcloud-link_nextcloud_1 bash -c 'php occ groupfolders:create another'`);

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
        },
        {
          id: 2,
          mountPoint: 'another',
          groups: [],
          quota: -3,
          size: 0,
          acl: false,
          manage: []
        },
      ]);
    });

    it('should return existing groupfolder', async () => {
      const groupfolder = await client.groupfolders.getFolder(1);

      expect(groupfolder).toEqual({
        acl: false,
        groups: [],
        id: 1,
        // manage: [], // known issue https://github.com/nextcloud/groupfolders/issues/885
        mountPoint: 'testing',
        quota: -3,
        size: 0,
      });
    });

    it('should return null if the requested groupfolder does not exist', async () => {
      const groupfolder = await client.groupfolders.getFolder(999);

      expect(groupfolder).toEqual(null);
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
    it('should remove existing groupfolder and return true', async () => {
      expect(await client.groupfolders.getFolder(3)).toBeDefined();

      expect(await client.groupfolders.removeFolder(3)).toBe(true);

      expect(await client.groupfolders.getFolder(3)).toBe(null);
    });

    it('should return true even if the groupfolder does not exist', async () => {
      expect(await client.groupfolders.getFolder(999)).toBe(null);

      expect(await client.groupfolders.removeFolder(999)).toBe(true);
    });
  });

  describe('addGroup(fid, gid), removeGroup(fid, gid), setPermissions(fid, gid, permissions)', () => {
    let groupfolderId;
    const group = 'admin';

    beforeAll(async () => {
      execSync(`docker exec -u 33 nextcloud-link_nextcloud_1 bash -c 'php occ groupfolders:create testing'`);

      groupfolderId = (await client.groupfolders.getFolders())?.[0]?.id;
    })

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

    it('should not throw when addign group to non-existing groupfolder', async () => {
      expect(await client.groupfolders.addGroup(groupfolderId + 100, group)).toBe(true);
    });

    it('should set group permissions on existing groupfolder', async () => {
      expect(await client.groupfolders.setPermissions(groupfolderId, group, 1)).toBe(true);

      expect(await client.groupfolders.getFolder(groupfolderId)).toMatchObject({ groups: { [group]: 1 } });

      expect(await client.groupfolders.setPermissions(groupfolderId, group, 0)).toBe(true);

      expect(await client.groupfolders.getFolder(groupfolderId)).toMatchObject({ groups: { [group]: 0 } });
    });

    it('should not throw when setting group permissions on non-existing groupfolder', async () => {
      expect(await client.groupfolders.setPermissions(groupfolderId + 100, group, 1)).toBe(true);
    });

    it('should remove group from existing groupfolder', async () => {
      expect(await client.groupfolders.removeGroup(groupfolderId, group)).toBe(true);

      const groupfolderAfter = await client.groupfolders.getFolder(groupfolderId);
      expect(groupfolderAfter.groups).toEqual([]);
    });
  });

  describe('enableACL(fid, enable)', () => {
    let groupfolderId;

    beforeAll(async () => {
      groupfolderId = (await client.groupfolders.getFolders())?.[0]?.id;
    })

    it('should enable ACL on existing groupfolder', async () => {
      expect(await client.groupfolders.enableACL(groupfolderId, true)).toBe(true);

      expect(await client.groupfolders.getFolder(groupfolderId)).toMatchObject({ acl: true });
    });

    it('should disable ACL on existing groupfolder', async () => {
      expect(await client.groupfolders.enableACL(groupfolderId, false)).toBe(true);

      expect(await client.groupfolders.getFolder(groupfolderId)).toMatchObject({ acl: false });
    });

    it('should not throw when enabling ACL on non-existing groupfolder', async () => {
      expect(await client.groupfolders.enableACL(groupfolderId + 100, true)).toBe(true);
    });
  });

  describe('setManageACL(fid, type, id, manageACL)', () => {
    let groupfolderId;

    beforeAll(async () => {
      groupfolderId = (await client.groupfolders.getFolders())?.[0]?.id;
    })

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
    let groupfolderId;

    beforeAll(async () => {
      groupfolderId = (await client.groupfolders.getFolders())?.[0]?.id;
    })

    it('should set quota on existing groupfolder', async () => {
      expect(await client.groupfolders.setQuota(groupfolderId, 1000)).toBe(true);

      expect(await client.groupfolders.getFolder(groupfolderId)).toMatchObject({ quota: 1000 });
    });

    it('should set quota on existing groupfolder', async () => {
      expect(await client.groupfolders.setQuota(groupfolderId, -3)).toBe(true);

      expect(await client.groupfolders.getFolder(groupfolderId)).toMatchObject({ quota: -3 });
    });

    it('should not throw when setting quota on non-existing groupfolder', async () => {
      expect(await client.groupfolders.setQuota(groupfolderId + 100, 1000)).toBe(true);
    });
  });

  describe('renameFolder(fid, mountpoint)', () => {
    let groupfolderId;

    beforeAll(async () => {
      groupfolderId = (await client.groupfolders.getFolders())?.[0]?.id;
    })

    it('should rename existing groupfolder', async () => {
      expect(await client.groupfolders.renameFolder(groupfolderId, 'new name')).toBe(true);

      expect(await client.groupfolders.getFolder(groupfolderId)).toMatchObject({ mountPoint: 'new name' });
    });

    it('should not throw when renaming non-existing groupfolder', async () => {
      expect(await client.groupfolders.renameFolder(groupfolderId + 100, 'new name')).toBe(true);
    });
  });
});
