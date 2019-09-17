import { NotFoundError }  from '../source/errors';
import NextcloudClient    from '../source/client';
import configuration      from './configuration';
import * as Stream        from 'stream';
import { Request }        from 'request';
import { join }           from 'path';

import {
  createFileDetailProperty,
  createOwnCloudFileDetailProperty,
  createNextCloudFileDetailProperty
} from '../source/helper';

describe('Webdav integration', function testWebdavIntegration() {
  const client = new NextcloudClient(configuration);

  beforeEach(async () => {
    const files = await client.getFiles('/');

    await Promise.all(files.map(async function (file) {
      await client.remove(`/${file}`);
    }));
  });

  describe('checkConnectivity()', () => {
    it('should return false if there is no connectivity', async () => {
      const badClient = new NextcloudClient(Object.assign({}, configuration, {
        url: 'http://127.0.0.1:65530'
      }));

      expect(await client.checkConnectivity()).toBe(true);
      expect(await badClient.checkConnectivity()).toBe(false);
    });
  });

  describe('exists(path)', () => {
    it('should return true if the given resource exists, false otherwise', async () => {
      const path = randomRootPath();

      expect(await client.exists(path)).toBe(false);

      await client.put(path, '');

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);
    });

    it('should not crash for nested folders', async () => {
      const path = `${randomRootPath()}${randomRootPath()}`;

      expect(await client.exists(path)).toBe(false);
    });
  });

  describe('404s', () => {
    it('should throw 404s when a resource is not found', async () => {
      const path  = randomRootPath();
      const path2 = randomRootPath();

      const nested = `${path}${path2}`;

      const stream = new Stream.Readable();

      try { await client.get(path);                  } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.getFiles(path);             } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.put(nested, '');            } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.rename(path, path2);        } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.getReadStream(path);        } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.getWriteStream(nested);     } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.pipeStream(nested, stream); } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
    });
  });

  describe('put & get', () => {
    it('should allow to save and get files without streaming', async () => {
      const path   = randomRootPath();
      const string = 'test';

      expect(await client.exists(path)).toBe(false);

      await client.put(path, string);

      expect((await client.get(path)).toString()).toBe(string);

      await client.remove(path);
    });

    it('should save a Buffer and get the file without streaming', async () => {
        const path = randomRootPath();
        const string = 'tėŠt àáâèéî';
        const buffer = Buffer.from(string);

        expect(await client.exists(path)).toBe(false);

        await client.put(path, buffer);

        expect((await  client.get(path)).toString()).toBe(string);

        await client.remove(path);
    });
  });

  describe('remove(path)', () => {
    it('should remove simple files properly', async () => {
      const path = randomRootPath();

      expect(await client.exists(path)).toBe(false);

      await client.put(path, '');

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);

      expect(await client.exists(path)).toBe(false);
    });

    it('should remove folders recursively', async () => {
      const path = randomRootPath();

      const file = `${path}${path}`;

      await client.touchFolder(path);

      expect(await client.exists(path)).toBe(true);

      await client.put(file, '');

      await client.remove(path);

      expect(await client.exists(file)).toBe(false);
      expect(await client.exists(path)).toBe(false);
    });
  });

  describe('touchFolder(path)', () => {
    it('should create folders', async () => {
      const path = randomRootPath();

      expect(await client.exists(path)).toBe(false);

      await client.touchFolder(path);

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);
    });

    it('should allow folders with spaces in their names', async () => {
      const path = `${randomRootPath()} test`;

      await client.touchFolder(path);

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);
    });

    it('should not complain if the folder already exists', async () => {
      const path = `${randomRootPath()} test`;

      await client.touchFolder(path);
      await client.touchFolder(path);

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);
    });

    it('should allow folders with accented characters', async () => {
      const path = `${randomRootPath()} testé`;

      await client.touchFolder(path);

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);
    });
  });

  describe('getFiles(path)', () => {
    it('should retrieve lists of files in a given folder', async () => {
      const path = randomRootPath();

      const fileName1 = 'file1';
      const fileName2 = 'file2';

      const file1 = `${path}/${fileName1}`;
      const file2 = `${path}/${fileName2}`;

      await client.touchFolder(path);
      await client.put(file1, '');
      await client.put(file2, '');

      expect(await client.exists(path)).toBe(true);
      expect(await client.exists(file1)).toBe(true);
      expect(await client.exists(file2)).toBe(true);

      const files = await client.getFiles(path);

      expect(files.length).toBe(2);
      expect(files.includes(fileName1)).toBe(true);
      expect(files.includes(fileName2)).toBe(true);

      await client.remove(path);
    });
  });

  describe('getFolderFileDetails(path)', () => {
    it('should retrieve lists of files in a given folder', async () => {
      const path = randomRootPath();

      const fileName1 = 'file1';
      const fileName2 = 'file2';

      const file1 = `${path}/${fileName1}`;
      const file2 = `${path}/${fileName2}`;

      await client.touchFolder(path);
      await client.touchFolder(file1);
      await client.put(file2, '');

      const files = await client.getFolderFileDetails(path);

      expect(files.length).toBe(2);

      expect(files[0].isFile).toBeFalsy();
      expect(files[0].name).toBe(fileName1);
      expect(files[0].isDirectory).toBeTruthy();
      expect(files[0].creationDate).toBeFalsy();
      expect(files[0].lastModified).toBeTruthy();
      expect(files[0].href).toBe(`/remote.php/dav/files/nextcloud${path}/${fileName1}`);

      expect(files[1].isFile).toBeTruthy();
      expect(files[1].name).toBe(fileName2);
      expect(files[1].isDirectory).toBeFalsy();
      expect(files[1].creationDate).toBeFalsy();
      expect(files[1].lastModified).toBeTruthy();
      expect(files[1].href).toBe(`/remote.php/dav/files/nextcloud${path}/${fileName2}`);

      await client.remove(path);
    });

    it('should retrieve the properties of a folder', async () => {
      const path = randomRootPath();

      await client.touchFolder(path);
      const properties = await client.getFolderProperties(path, [
        createOwnCloudFileDetailProperty('fileid', true),
        createOwnCloudFileDetailProperty('size', true),
        createOwnCloudFileDetailProperty('owner-id')
      ]);

      expect(properties['oc:owner-id'].content).toBe('nextcloud');

      await client.remove(path);
    });
  });

  describe('createFolderHierarchy(path)', () => {
    it('should create hierarchies properly, even when part of it already exists', async () => {
      const path = randomRootPath();

      const subFolder1 = 'sub1';
      const subFolder2 = 'sub2';
      const subFolder3 = 'sub3';

      await client.touchFolder(path);

      const subFolder1Path = `${path}/${subFolder1}`;

      const subFolder2Path = `${subFolder1Path}/${subFolder2}`;

      const subFolder3Path = `${subFolder2Path}/${subFolder3}`;

      await client.createFolderHierarchy(subFolder3Path);

      expect(await client.exists(path)).toBe(true);
      expect(await client.exists(subFolder1Path)).toBe(true);
      expect(await client.exists(subFolder2Path)).toBe(true);
      expect(await client.exists(subFolder3Path)).toBe(true);

      await client.remove(path);
    }, 10000);
  });

  describe('rename(path, newName)', () => {
    it('should work on simple files', async () => {
      const source  = randomRootPath();
      const renamed = randomRootPath().slice(1);

      const renamedPath = `/${renamed}`;

      await client.put(source, '');

      expect(await client.exists(source)).toBe(true);

      await client.rename(source, renamed);

      expect(await client.exists(source)).toBe(false);
      expect(await client.exists(renamedPath)).toBe(true);

      await client.remove(renamedPath);
    });

    it('should work on folders too', async () => {
      const source  = randomRootPath();
      const renamed = randomRootPath().slice(1);

      const renamedPath = `/${renamed}`;

      await client.touchFolder(source);

      expect(await client.exists(source)).toBe(true);

      await client.rename(source, renamed);

      expect(await client.exists(source)).toBe(false);
      expect(await client.exists(renamedPath)).toBe(true);

      await client.remove(renamedPath);
    });
  });

  describe('move(path, newName)', () => {
    it('should work on simple files', async () => {
      const folder  = randomRootPath();
      const source  = randomRootPath();
      const renamed = randomRootPath().slice(1);

      const renamedPath = `/${folder}/${renamed}`;

      await client.createFolderHierarchy(folder);

      await client.put(source, '');

      expect(await client.exists(source)).toBe(true);

      await client.move(source, renamedPath);

      expect(await client.exists(source)).toBe(false);
      expect(await client.exists(renamedPath)).toBe(true);

      await client.remove(renamedPath);
    });

    it('should work on folders too', async () => {
      const folder  = randomRootPath();
      const source  = randomRootPath();
      const file    = randomRootPath();
      const renamed = randomRootPath().slice(1);

      const sourceFilePath    = `${source}${file}`;
      const renamedFolderPath = `${folder}/${renamed}`;

      const renamedPathFile = `${renamedFolderPath}${file}`;

      await client.createFolderHierarchy(folder);
      await client.createFolderHierarchy(source);

      await client.put(sourceFilePath, '');

      expect(await client.exists(source)).toBe(true);

      await client.move(source, renamedFolderPath);

      expect(await client.exists(source)).toBe(false);
      expect(await client.exists(renamedPathFile)).toBe(true);
      expect(await client.exists(renamedFolderPath)).toBe(true);

      await client.remove(renamedFolderPath);
    });
  });

  describe('getReadStream(path)', () => {
    it('should be able to stream files off of Nextcloud instances', async () => {
      const string = 'test';
      const path   = randomRootPath();

      let data = '';

      await client.put(path, string);

      const stream = await client.getReadStream(path);

      stream.on('data', chunk => data += chunk.toString());

      await new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
      });

      expect(data).toBe(string);

      await client.remove(path);
    });
  });

  describe('getWriteStream(path)', () => {
    it('should pipe readable streams to the Nextcloud instance', async () => {
      const string = 'test';
      const path   = randomRootPath();

      const stream : Request = await client.getWriteStream(path);

      expect(stream instanceof Stream).toBe(true);

      await new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);

        stream.write(string);
        stream.end();
      });

      expect(await client.get(path)).toBe(string);

      await client.remove(path);
    });
  });

  describe('pipeStream(path, stream)', () => {
    it('should pipe readable streams to the Nextcloud instance', async () => {
      const string = 'test';
      const path   = randomRootPath();

      const stream = getStream(string);

      await client.pipeStream(path, stream);

      expect(await client.get(path)).toBe(string);

      await client.remove(path);
    });
  });

  describe('Path reservation', () => {
    it('should allow saving a file with empty contents, then getting a write stream for it immediately', async () => {
      const path = randomRootPath();

      await client.put(path, '');

      const writeStream : Request = await client.getWriteStream(path);

      const writtenStream = getStream('test');

      const completionPromise = new Promise((resolve, reject) => {
        writeStream.on('end', resolve);
        writeStream.on('error', reject);
      });

      writtenStream.pipe(writeStream);

      await completionPromise;
    });
  });

  describe('file info', () => {
    const path = randomRootPath();
    const file1 = 'file1.txt';


    it('should retrieve extra properties when requested', async () => {
      await client.touchFolder(path);

      await client.put(`${path}/${file1}`, '');

      let folderDetails = await client.getFolderFileDetails(path, [
        createOwnCloudFileDetailProperty('fileid', true),
        createOwnCloudFileDetailProperty('size', true),
        createOwnCloudFileDetailProperty('owner-id'),
        createNextCloudFileDetailProperty('has-preview', true),
        createFileDetailProperty('http://doesnt/exist', 'de', 'test', false),
        createFileDetailProperty('http://doesnt/exist', 'de', 'test2', false, 42),
        createFileDetailProperty('http://doesnt/exist', 'de', 'test3', true),
        createFileDetailProperty('http://doesnt/exist', 'de', 'test4', true, 37),
      ]);

      folderDetails = folderDetails.filter(data => data.type === 'file');

      const fileDetails = folderDetails[0];
      expect(fileDetails.extraProperties['owner-id']).toBe('nextcloud');
      expect(fileDetails.extraProperties['has-preview']).toBe(false);
      expect(fileDetails.extraProperties['test']).toBeUndefined();
      expect(fileDetails.extraProperties['test2']).toBe(42);
      expect(fileDetails.extraProperties['test3']).toBeUndefined();
      expect(fileDetails.extraProperties['test4']).toBe(37);
      expect(fileDetails.extraProperties['test999']).toBeUndefined();

      await client.remove(path);
    });
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
      const activities = await client.activities.get(-5);
      expect(activities).toBeNull();

      // TODO: Add test for error when requesting activity of different user. (after OCS supports creating users).
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
      const user = await client.users.get(invalidUserId);

      expect(user).toBeNull();
    });
  });

  describe('common function', () => {
    const userId = 'nextcloud';
    const path = randomRootPath();
    const filePath = join(path, 'test.txt');
    const notExistingFilePath = join(path, 'not_existing_file.txt');
    const notExistingFullPath = join(randomRootPath(), 'not_existing_file.txt');
    const string = 'Dummy content';

    it('should retrieve the creator of a path', async () => {
      await client.touchFolder(path);
      expect(await client.exists(path)).toBe(true);

      await client.put(filePath, string);

      await expect(client.getCreatorByPath(path)).resolves.toBe(userId);
      await expect(client.getCreatorByPath(filePath)).resolves.toBe(userId);
      await expect(client.getCreatorByPath(notExistingFilePath)).rejects.toBeInstanceOf(Error);
      await expect(client.getCreatorByPath(notExistingFullPath)).rejects.toBeInstanceOf(Error);

      await client.remove(path);
    }, 10000);
  });
});

function randomRootPath(): string {
  return `/${Math.floor(Math.random() * 1000000000)}`;
}

function getStream(string): Stream.Readable {
  let stream = new Stream.Readable();

  // See https://stackoverflow.com/questions/12755997/how-to-create-streams-from-string-in-node-js
  stream._read = () => {};

  stream.push(string);
  stream.push(null);

  return stream;
}
