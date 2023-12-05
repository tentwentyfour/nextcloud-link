import { OcsError } from '../source/errors';
import NextcloudClient             from '../source/client';
import configuration               from './configuration';
import { join }                    from 'path';

import { OcsShareType, OcsSharePermissions } from '../source/ocs/types';
import { OcsNewUser } from '../lib/types/ocs/types';
import { createOwnCloudFileDetailProperty } from '../source/helper';

describe('Webdav new integration', function testWebdavIntegration() {
  const client = new NextcloudClient(configuration.connectionOptions);

  beforeEach(async () => {
    const files = await client.getFilesDetailed('/');

    await Promise.all(files.map(async (file) => {
      await client.remove(`/${file.filename}`);
    }));
  });

  describe('activity', () => {
    const folder1 = randomRootPath();
    const folder2 = folder1 + randomRootPath();
    const file1 = 'file1.txt';
    const file2 = 'file2.txt';

    beforeEach(async () => {
      await client.touchFolder(folder1);
      await client.touchFolder(folder2);
      await client.put(`${folder1}/${file1}`, '');

      // Create activity
      await client.move(`${folder1}/${file1}`, `${folder2}/${file1}`);
      await client.move(`${folder2}/${file1}`, `${folder1}/${file1}`);
      await client.rename(`${folder1}/${file1}`, file2);
      await client.rename(`${folder1}/${file2}`, file1);
    });

    afterEach(async () => {
      await client.remove(folder1);
    });

    it('should retrieve the activity information of a file', async () => {
      let folderDetails = await client.getFolderFileDetails(folder1, [
        createOwnCloudFileDetailProperty('fileid', true),
      ]);
      folderDetails = folderDetails.filter(data => data.type === 'file');

      const fileDetails = folderDetails[0];
      expect(fileDetails.extraProperties['fileid']).toBeDefined();

      const fileId = fileDetails.extraProperties['fileid'] as number;
      const allActivities = await client.activities.get(fileId);
      expect(allActivities.length).toBe(5);

      const activity = allActivities.filter(activity => activity.type === 'file_created')[0];

      expect(activity.user).toBe('nextcloud');

      // data is the same regardless of sort direction.
      const ascActivities = await client.activities.get(fileId, 'asc');
      expect(ascActivities.length).toBe(5);
      expect(ascActivities.length).toBe(allActivities.length);
      for (let ascIdx = 0; ascIdx < ascActivities.length; ascIdx++) {
        const allIdx = (ascActivities.length - 1) - ascIdx;

        expect(ascActivities[ascIdx].activityId).toBe(allActivities[allIdx].activityId);
      }

      // limit returns the expected amount.
      const threeAscActivities = await client.activities.get(fileId, 'asc', 3);
      expect(threeAscActivities.length).toBe(3);
      for (let idx = 0; idx < threeAscActivities.length; idx++) {
        expect(threeAscActivities[idx].activityId).toBe(ascActivities[idx].activityId);
      }

      // limited amount from different sort matches up.
      const sinceAscIdx = 1;
      const twoAscSinceActivities = await client.activities.get(fileId, 'asc', 2, ascActivities[sinceAscIdx].activityId);
      for (let twoAscIdx = 0; twoAscIdx < twoAscSinceActivities.length; twoAscIdx++) {
        const ascIdx = twoAscIdx + (sinceAscIdx + 1);
        expect(twoAscSinceActivities[twoAscIdx].activityId).toBe(ascActivities[ascIdx].activityId);
      }

      // since will return results AFTER the supplied id. Limit is maximum.
      const sinceAllIdx = 3;
      const oneAscSinceActivities = await client.activities.get(fileId, 'desc', 2, allActivities[sinceAllIdx].activityId);
      expect(oneAscSinceActivities.length).toBe(1);
      expect(oneAscSinceActivities[0].activityId).toBe(allActivities[sinceAllIdx + 1].activityId);

      // non-existing/invalid activityIds shouldn't throw an error but return null.
      let errorWhenRequestingWithInvalidActivityId = false;
      await client.activities.get(-5)
      .catch(error => {
        errorWhenRequestingWithInvalidActivityId = true;
        expect(error).toBeInstanceOf(OcsError);
        expect(error.statusCode).toBe(304);
      });
      expect(errorWhenRequestingWithInvalidActivityId).toBeTruthy();
    });
  });

  describe('user info', () => {
    const userId = 'nextcloud';
    const invalidUserId = 'nextcloud2';

    it('should retrieve user information', async () => {
      const user = await client.users.get(userId);

      expect(user).toBeDefined();
      expect(user).not.toBeNull();

      expect(user.enabled).toBeTruthy();
    });

    it('should get a null value when requesting a non-existing user', async () => {
      await expect(client.users.get(invalidUserId)).rejects.toBeInstanceOf(OcsError);
    });
  });

  describe('common function', () => {
    const userId = 'nextcloud';
    const path = randomRootPath();
    const filePath = `${path}${path}`;
    const notExistingFilePath = join(path, 'not_existing_file.txt');
    const notExistingFullPath = join(randomRootPath(), 'not_existing_file.txt');
    const string = 'Dummy content';

    it('should retrieve the creator of a path', async () => {
      await client.touchFolder(path);
      expect(await client.exists(path)).toBeTruthy();

      await client.put(filePath, string);

      await expect(client.getCreatorByPath(path)).resolves.toBe(userId);
      await expect(client.getCreatorByPath(filePath)).resolves.toBe(userId);
      await expect(client.getCreatorByPath(notExistingFilePath)).rejects.toBeInstanceOf(Error);
      await expect(client.getCreatorByPath(notExistingFullPath)).rejects.toBeInstanceOf(Error);

      await client.remove(path);
    });
  });

  describe('OCS commands with expected users and groups', () => {
    const numTestUsers = 2;
    const expectedUsers: OcsNewUser[] = [];
    expectedUsers.push({
      userid: 'nextcloud',
      password: 'nextcloud',
      displayName: 'nextcloud',
      email: 'admin@nextcloud-link.test'
    });

    for (let i = 1; i <= numTestUsers; i++) {
      expectedUsers.push({
        userid: `test_user${i}`,
        password: 'nextcloud',
        displayName: `Test User ${i}`,
        email: `test_user${i}@nextcloud-link.test`
      });
    }

    const numTestGroups = 2;
    const expectedGroups: string[] = [
      'admin'
    ];
    for (let i = 1; i <= numTestGroups; i++) {
      expectedGroups.push(`group_test_${i}`);
    }

    beforeAll(async () => {
      return new Promise<void>(async (done) => {
        try {
          await expectedUsers
          .filter(user => user.userid !== 'nextcloud')
          .forEach(async user => {
            await client.users.add(user);
          });


          await expectedGroups
          .filter(groupId => groupId !== 'admin')
          .forEach(async groupId => {
            await client.groups.add(groupId);
          });

          await new Promise(res => setTimeout(() => {
            // Added timeout because Nextcloud doesn't play nice with quick adds and reads.
            done();
          }, 2000));
        } catch (error) {
          console.error('Error during afterAll', error);
          done();
        }
      });
    }, 20000);

    afterAll(async () => {
      try {
        const userIds = await client.users.list();
        if (userIds) {
          userIds
          .filter(userId => userId !== 'nextcloud')
          .forEach(async userId => {
            await client.users.delete(userId);
          });
        }

        const groupIds = await client.groups.list();
        if (groupIds) {
          groupIds
          .filter(groupId => groupId !== 'admin')
          .forEach(async groupId => {
            await client.groups.delete(groupId);
          });
        }
      } catch (error) {
        console.error('Error during afterAll', error);
      }
    }, 20000);

    it('should add and remove users', async () => {
      const user: OcsNewUser = {
        userid: 'addUserTest',
        password: 'nextcloud'
      };

      let userAdded = await client.users.add(user);
      let userDeleted = await client.users.delete(user.userid);

      expect(userAdded).toBeTruthy();
      expect(userDeleted).toBeTruthy();
    }, 5000);

    it('should list all users', async () => {
      const userIds = await client.users.list();

      expect(userIds.length).toBe(expectedUsers.length);

      for (let i = 0; i < userIds.length; i++) {
        expect(userIds[i]).toBe(expectedUsers[i].userid);
      }
    }, 10000);

    it('should get data of a single user', async () => {
      const expectedUser = expectedUsers[1];

      const user = await client.users.get(expectedUser.userid);

      expect(user.displayname).toBe(expectedUser.displayName);
      expect(user.enabled).toBeTruthy();
    });

    it('should manage a user\'s groups', async () => {
      const userId = expectedUsers[1].userid;
      const groupId = expectedGroups[1];

      const addedToGroup = await client.users.addToGroup(userId, groupId);
      const groups = await client.users.getGroups(userId);
      const removedFromGroup = await client.users.removeFromGroup(userId, groupId);

      expect(addedToGroup).toBeTruthy();
      expect(removedFromGroup).toBeTruthy();
      expect(groups[0]).toBe(groupId);
    }, 10000);

    it('should edit a user', async () => {
      const expectedUser = expectedUsers[1];
      const editedDisplayName = 'Edited displayname';

      await client.users.edit(expectedUser.userid, 'displayname', editedDisplayName);

      const user = await client.users.get(expectedUser.userid);
      expect(user.id).toBe(expectedUser.userid);
      expect(user.displayname).toBe(editedDisplayName);

      await client.users.edit(expectedUser.userid, 'displayname', expectedUser.displayName!);
    }, 13000);

    it('should be able to resend the welcome email', async () => {
      const expectedUser = expectedUsers[1];

      const success = await client.users.resendWelcomeEmail(expectedUser.userid);
      expect(success).toBeTruthy();
    });

    it('should be able to change a user\'s enabled state', async () => {
      const userId = expectedUsers[1].userid;

      expect(await client.users.setEnabled(userId, false)).toBeTruthy();
      const user = await client.users.get(userId);
      expect(await client.users.setEnabled(userId, true)).toBeTruthy();
      expect(user.enabled).toBe(false);
    }, 10000);

    it('should be able to change a user\'s subAdmin rights', async () => {
      const userId = expectedUsers[1].userid;
      const groupId = expectedGroups[1];

      const addedToGroup = await client.users.addSubAdminToGroup(userId, groupId);
      const subAdmins = await client.users.getSubAdminGroups(userId);
      const removedFromGroup = await client.users.removeSubAdminFromGroup(userId, groupId);

      expect(addedToGroup).toBeTruthy();
      expect(removedFromGroup).toBeTruthy();
      expect(subAdmins).toHaveLength(1);
      expect(subAdmins[0]).toBe(groupId);
    }, 10000);

    it('should list all groups', async () => {
      const groupIds = await client.groups.list();

      expect(groupIds.length).toBe(expectedGroups.length);

      for (let i = 0; i < groupIds.length; i++) {
        expect(groupIds[i]).toBe(expectedGroups[i]);
      }
    });

    it('should add and remove groups', async () => {
      const groupName = 'addGroupTest';

      const added = await client.groups.add(groupName);
      const groupIds = await client.groups.list();
      const removed = await client.groups.delete(groupName);

      expect(added).toBeTruthy();
      expect(removed).toBeTruthy();
      expect(groupIds).toContain(groupName);
    });

    it('should list the users of a group', async () => {
      return new Promise<void>(async (done) => {
        const groupName = expectedGroups[1];

        await expectedUsers.forEach(async user => {
          await client.users.addToGroup(user.userid, groupName);
        });

        await new Promise(res => setTimeout(async () => {
          const users = await client.groups.getUsers(groupName);

          await expectedUsers.forEach(async user => {
            await client.users.removeFromGroup(user.userid, groupName);
          });

          // Added timeout because Nextcloud doesn't play nice with quick adds and reads.
          await new Promise(res => setTimeout(async () => {
            const users2 = await client.groups.getUsers(groupName);

            expect(users).toHaveLength(expectedUsers.length);
            expect(users2).toHaveLength(0);

            done();
          }, 1000));
        }, 1000));
      });
    }, 10000);

    it('should list the sub-admins of a group', async () => {
      return new Promise<void>(async (done) => {
        const groupName = expectedGroups[1];
        const added = {};
        const removed = {};

        await expectedUsers.forEach(async user => {
          const success = await client.users.addSubAdminToGroup(user.userid, groupName);
          added[user.userid] = success;
        });

        await new Promise(res => setTimeout(async () => {
          const usersAfterAdd = await client.groups.getSubAdmins(groupName);

          await expectedUsers.forEach(async user => {
            const success = await client.users.removeSubAdminFromGroup(user.userid, groupName);
            removed[user.userid] = success;
        });

          // Added timeout because Nextcloud doesn't play nice with quick adds and reads.
          await new Promise(res => setTimeout(async () => {
            const usersAfterRemove = await client.groups.getSubAdmins(groupName);

            expect(usersAfterAdd).toHaveLength(expectedUsers.length);
            expect(usersAfterRemove).toHaveLength(0);

            expectedUsers.forEach(user => {
              expect(added[user.userid]).toBeTruthy();
              expect(removed[user.userid]).toBeTruthy();
            });

            done();
          }, 1000));
        }, 1000));
      });
    }, 10000);


    describe('requires files and folders', () => {
      const folder1 = randomRootPath();
      const file1 = 'file1.txt';
      const filePath = `${folder1}/${file1}`;

      beforeEach(async () => {
        try {
          await client.touchFolder(folder1);
          await client.put(`${folder1}/${file1}`, '');
        } catch (error) {
          console.error('Error during file/folder beforeAll', error);
        }
      });

      it('should be unable to retrieve acitivies of other users', async () => {
        const expectedUser = expectedUsers[1];

        const otherClient = client.as(expectedUser.userid, expectedUser.password!);

        let folderDetails = await client.getFolderFileDetails(folder1, [
          createOwnCloudFileDetailProperty('fileid', true),
        ]);
        folderDetails = folderDetails.filter(data => data.type === 'file');

        const fileDetails = folderDetails[0];
        const fileId = fileDetails.extraProperties['fileid'] as number;

        const clientActivities = await client.activities.get(fileId);

        let errorWhenRequestingOtherUserActivities = false;
        await otherClient.activities.get(fileId)
        .catch(error => {
          errorWhenRequestingOtherUserActivities = true;
          expect(error).toBeInstanceOf(OcsError);
          expect(error.statusCode).toBe(304);
        });

        expect(clientActivities).toHaveLength(1);
        expect(errorWhenRequestingOtherUserActivities).toBeTruthy();
      });

      describe('sharing API', () => {
        const password1 = 'as90123490j09jdsad';
        const password2 = 'd90jk0324j0ds9a9ad';

        it('should get a list of all shares', async () => {
          const expectedUser = expectedUsers[1];
          const expectedGroup = expectedGroups[1];
          await client.shares.add(folder1, OcsShareType.publicLink, '', OcsSharePermissions.read, password1);
          await client.shares.add(folder1, OcsShareType.user, expectedUser.userid, OcsSharePermissions.all);
          await client.shares.add(folder1, OcsShareType.group, expectedGroup, OcsSharePermissions.read | OcsSharePermissions.delete);

          const shares = await client.shares.list();

          expect(shares).toHaveLength(3);
        });

        it('should create a new share', async () => {
          const expectedGroup = expectedGroups[1];
          const shareType = OcsShareType.group;

          const addedShare = await client.shares.add(
            folder1,
            shareType,
            expectedGroup,
            OcsSharePermissions.create | OcsSharePermissions.delete | OcsSharePermissions.share
          );

          expect(addedShare).toBeDefined();
          expect(addedShare.permissions & OcsSharePermissions.delete).toBe(OcsSharePermissions.delete);
          expect(addedShare.permissions & OcsSharePermissions.update).not.toBe(OcsSharePermissions.update);
          expect(addedShare.path).toBe(folder1);
          expect(addedShare.shareType).toBe(shareType);
        });

        it('should get shares for a specific file or folder', async () => {
          const nonExistingFolder = '/nonExistingFolder';
          const expectedUser = expectedUsers[1];
          const expectedGroup = expectedGroups[1];
          await client.shares.add(folder1, OcsShareType.publicLink, '', OcsSharePermissions.read, password1);
          await client.shares.add(filePath, OcsShareType.user, expectedUser.userid, OcsSharePermissions.all);
          await client.shares.add(filePath, OcsShareType.group, expectedGroup, OcsSharePermissions.read | OcsSharePermissions.delete);

          const shares = await client.shares.list(folder1, false, true);
          expect(shares).toHaveLength(2);

          const fileShares = await client.shares.list(filePath);
          expect(fileShares).toHaveLength(2);

          let errorWhenRequestingNonExistingFolder = false;
          await client.shares.list(nonExistingFolder, false, true)
          .catch(error => {
            errorWhenRequestingNonExistingFolder = true;
            expect(error).toBeInstanceOf(OcsError);
            expect(error.statusCode).toBe(404);
          });
          expect(errorWhenRequestingNonExistingFolder).toBeTruthy();

          let errorWhenRequestingSubFilesFromFile = false;
          await client.shares.list(filePath, false, true)
          .catch(error => {
            errorWhenRequestingSubFilesFromFile = true;
            expect(error).toBeInstanceOf(OcsError);
            expect(error.statusCode).toBe(400);
          });
          expect(errorWhenRequestingSubFilesFromFile).toBeTruthy();
        });

        it('should get information about a known share', async () => {
          const addedShare = await client.shares.add(folder1, OcsShareType.publicLink, '', OcsSharePermissions.read, password1);
          const share = await client.shares.get(addedShare.id);

          expect(share.id).toBe(addedShare.id);
        });

        it('should delete a share', async () => {
          const invalidShareId = -1;
          const addedShare = await client.shares.add(folder1, OcsShareType.publicLink, '', OcsSharePermissions.read, password1);
          const shareDeleted = await client.shares.delete(addedShare.id);

          expect(shareDeleted).toBeTruthy();

          let errorWhenDeletingInvalidShareId = false;
          await client.shares.delete(invalidShareId)
          .catch(error => {
            errorWhenDeletingInvalidShareId = true;
            expect(error).toBeInstanceOf(OcsError);
            expect(error.statusCode).toBe(404);
          });
          expect(errorWhenDeletingInvalidShareId).toBeTruthy();
        });

        it('should edit a share', async () => {
          const expectedGroup = expectedGroups[1];
          const tempDate = new Date();
          const permissions1 = OcsSharePermissions.all;
          const date1 = `${tempDate.getFullYear() + 1}-06-24`;
          const note1 = 'This is the note';
          const publicSharePermissions1 = OcsSharePermissions.read | OcsSharePermissions.share | OcsSharePermissions.update | OcsSharePermissions.create | OcsSharePermissions.delete;

          const groupShare = await client.shares.add(folder1, OcsShareType.group, expectedGroup, OcsSharePermissions.delete);
          const publicShare = await client.shares.add(folder1, OcsShareType.publicLink, '', OcsSharePermissions.read, password1);

          const permissionsUpdated = await client.shares.edit.permissions(groupShare.id, permissions1);
          const expireDateUpdated = await client.shares.edit.expireDate(groupShare.id, date1);
          const noteUpdated = await client.shares.edit.note(groupShare.id, note1);

          // Passwords are only on public links
          const passwordUpdated = await client.shares.edit.password(publicShare.id, password2);
          const publicUploadUpdated = await client.shares.edit.publicUpload(publicShare.id, true);

          expect(permissionsUpdated.permissions).toBe(permissions1);
          expect(expireDateUpdated.expiration).toBe(`${date1} 00:00:00`);
          expect(noteUpdated.note).toBe(note1);
          expect(passwordUpdated.password).not.toBe(publicShare.password);
          expect(publicShare.permissions).toBe(OcsSharePermissions.read | OcsSharePermissions.share);
          expect(publicUploadUpdated.permissions).toBe(publicSharePermissions1);
        });
      });
    });
  });
});

function randomRootPath(): string {
  return `/${Math.floor(Math.random() * 1000000000)}`;
}
