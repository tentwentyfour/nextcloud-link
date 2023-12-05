import { NotFoundError, OcsError, ConflictError } from '../source/errors';
import configuration               from './configuration';
import Stream                      from 'stream';

import { WebDavClient } from '../source/webdav.js';

import { createDetailProperty } from '../source/webdav.utils';

describe('Webdav new integration', function testWebdavIntegration() {
  const { username, password, url } = configuration.connectionOptions;
  let client: WebDavClient;

  beforeAll(async () => {
    client = await WebDavClient.create(url, {
      username,
      password
    });
  });

  beforeEach(async () => {
    const files = await client.getFilesDetailed('/');

    await Promise.all(files.map(async (file) => {
      await client.remove(`/${file.filename}`);
    }));
  });

  describe('checkConnectivity()', () => {
    it('should be able to connect', async () => {
      expect(await client.checkConnectivity()).toBeTruthy();
    });

    it('should return false if there is no connectivity', async () => {
      const badClient = await WebDavClient.create('http://127.0.0.1:65530', {
        username,
        password
      });

      expect(await badClient.checkConnectivity()).toBe(false);
    });
  });

  describe('404s', () => {
    it('should throw 404s when a resource is not found', async () => {
      const path  = randomRootPath();
      const path2 = randomRootPath();

      const nestedPath = `${path}${path2}`;

      const readStream = new Stream.Readable();
      const writeStream = new Stream.Writable();

      try { await client.get(path); fail('Should have thrown'); } catch (error) { expect(error instanceof NotFoundError).toBeTruthy(); }
      try { await client.getFiles(path); fail('Should have thrown'); } catch (error) { expect(error instanceof NotFoundError).toBeTruthy(); }
      try { await client.put(nestedPath, ''); fail('Should have thrown'); } catch (error) { expect(error instanceof NotFoundError).toBeTruthy(); }
      try { await client.rename(path, path2); fail('Should have thrown'); } catch (error) { expect(error instanceof NotFoundError).toBeTruthy(); }
      try { await client.getReadStream(nestedPath); fail('Should have thrown'); } catch (error) { expect(error instanceof NotFoundError).toBeTruthy(); }
      try { await client.getWriteStream(nestedPath); fail('Should have thrown'); } catch (error) { expect(error instanceof NotFoundError).toBeTruthy(); }
      try { await client.uploadFromStream(nestedPath, readStream); fail('Should have thrown'); } catch (error) { expect(error instanceof NotFoundError).toBeTruthy(); }
      try { await client.downloadToStream(nestedPath, writeStream); fail('Should have thrown'); } catch (error) { expect(error instanceof NotFoundError).toBeTruthy(); }
    });
  });

  describe('touchFolder()', () => {
    it('should fail when no path provided', async () => {
      try {
        await client.touchFolder('');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      try {
        await client.touchFolder(undefined as any);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should be able to create a folder', async () => {
      const path = randomRootPath();

      await client.touchFolder(path);

      expect(await client.exists(path)).toBeTruthy();
    });

    it('should be able to create a nested folder', async () => {
      const path = `${randomRootPath()}/foo/bar`;

      await client.touchFolder(path);

      expect(await client.exists(path)).toBeTruthy();
    });

    it('should create folders', async () => {
      const path = randomRootPath();

      expect(await client.exists(path)).toBe(false);

      await client.touchFolder(path);

      expect(await client.exists(path)).toBeTruthy();

      await client.remove(path);
    });

    it('should allow folders with spaces in their names', async () => {
      const path = `${randomRootPath()} test`;

      await client.touchFolder(path);

      expect(await client.exists(path)).toBeTruthy();

      await client.remove(path);
    });

    it('should not complain if the folder already exists', async () => {
      const path = `${randomRootPath()} test`;

      await client.touchFolder(path);
      await client.touchFolder(path);

      expect(await client.exists(path)).toBeTruthy();

      await client.remove(path);
    });

    it('should allow folders with accented characters', async () => {
      const path = `${randomRootPath()} testé`;

      await client.touchFolder(path);

      expect(await client.exists(path)).toBeTruthy();

      await client.remove(path);
    });

    it('should create hierarchies properly, even when part of it already exists', async () => {
      const path = randomRootPath();

      const subFolder1 = 'sub1';
      const subFolder2 = 'sub2';
      const subFolder3 = 'sub3';

      await client.touchFolder(path);

      const subFolder1Path = `${path}/${subFolder1}`;

      const subFolder2Path = `${subFolder1Path}/${subFolder2}`;

      const subFolder3Path = `${subFolder2Path}/${subFolder3}`;

      await client.touchFolder(subFolder3Path);

      expect(await client.exists(path)).toBeTruthy();
      expect(await client.exists(subFolder1Path)).toBeTruthy();
      expect(await client.exists(subFolder2Path)).toBeTruthy();
      expect(await client.exists(subFolder3Path)).toBeTruthy();

      await client.remove(path);
    }, 10000);
  });

  describe('remove()', () => {
    it('should be able to remove a folder', async () => {
      const path = randomRootPath();

      await client.touchFolder(path);

      expect(await client.exists(path)).toBeTruthy();

      await client.remove(path);

      expect(await client.exists(path)).toBe(false);
    });

    it('should throw an error if the folder does not exist', async () => {
      const path = randomRootPath();

      try {
        await client.remove(path);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
      }
    });

    it('should remove simple files properly', async () => {
      const path = randomRootPath();

      expect(await client.exists(path)).toBe(false);

      await client.put(path, '');

      expect(await client.exists(path)).toBeTruthy();

      await client.remove(path);

      expect(await client.exists(path)).toBe(false);
    });

    it('should remove folders recursively', async () => {
      const path = randomRootPath();

      const file = `${path}${path}/file.txt`;

      await client.touchFolder(`${path}${path}`);

      expect(await client.exists(path)).toBeTruthy();

      await client.put(file, '');

      await client.remove(path);

      expect(await client.exists(file)).toBe(false);
      expect(await client.exists(path)).toBe(false);
    });
  });

  describe('put()', () => {

    it('should be able to save a file', async () => {
      const path = randomRootPath();

      await client.put(path, 'test');

      expect(await client.exists(path)).toBeTruthy();
    });

    it('should be able to save a file with accented characters', async () => {
      const path = randomRootPath();

      await client.put(path, 'tėŠt àáâèéî');

      expect(await client.exists(path)).toBeTruthy();
    });

    it('should be able to save a file with spaces in its name', async () => {
      const path = `${randomRootPath()} test`;

      await client.put(path, 'test');

      expect(await client.exists(path)).toBeTruthy();
    });

    it('should be able to save to nested folders', async () => {
      const path = `${randomRootPath()}/foo`;
      const file = `${path}/file`;

      await client.touchFolder(path);
      await client.put(file, 'test');

      expect(await client.exists(file)).toBeTruthy();
    })

    it('should not be able to save to a file representing a folder', async () => {
      const path = randomRootPath();
      const file1 = `${path}/file1`;
      const file2 = `${file1}/file2`;

      await client.touchFolder(path);
      await client.put(file1, '');

      expect(await client.exists(file1)).toBeTruthy();

      try {
        await client.put(file2, '');
      } catch (error) {
        expect(error instanceof NotFoundError).toBeTruthy();
      }
    });

    it('should not be able to save to a folder', async () => {
      const path = randomRootPath();

      await client.touchFolder(path);

      try {
        await client.put(path, 'test');
      } catch (error) {
        expect(error instanceof ConflictError).toBeTruthy();
      }
    });

    it('should not be able to save to a parent folder that does not exist', async () => {
      const path = `${randomRootPath()}/file`;

      try {
        await client.put(path, 'test');
      } catch (error) {
        expect(error instanceof NotFoundError).toBeTruthy();
      }
    })
  });

  describe('get()', () => {
    it('should be able to get a file', async () => {
      const path = randomRootPath();
      const string = 'test';

      await client.put(path, string);

      expect((await client.get(path)).toString()).toBe(string);

      await client.remove(path);
    });

    it('should be able to get a file with accented characters', async () => {
      const path = randomRootPath();
      const string = 'tėŠt àáâèéî';

      await client.put(path, string);

      expect((await client.get(path)).toString()).toBe(string);

      await client.remove(path);
    });

  });

  describe('rename(path, newName)', () => {
    it('should rename simple files', async () => {
      const source  = randomRootPath();
      const renamed = randomRootPath().slice(1);

      const renamedPath = `/${renamed}`;

      await client.put(source, '');

      expect(await client.exists(source)).toBeTruthy();

      await client.rename(source, renamed);

      expect(await client.exists(source)).toBe(false);
      expect(await client.exists(renamedPath)).toBeTruthy();

      await client.remove(renamedPath);
    });

    it('should rename folder', async () => {
      const source  = randomRootPath();
      const renamed = randomRootPath().slice(1);

      const renamedPath = `/${renamed}`;

      await client.touchFolder(source);

      expect(await client.exists(source)).toBeTruthy();

      await client.rename(source, renamed);

      expect(await client.exists(source)).toBe(false);
      expect(await client.exists(renamedPath)).toBeTruthy();

      await client.remove(renamedPath);
    });
  });

  describe('exists(path)', () => {
    it('should return true if the given resource exists, false otherwise', async () => {
      const path = randomRootPath();

      expect(await client.exists(path)).toBe(false);

      await client.put(path, '');

      expect(await client.exists(path)).toBeTruthy();

      await client.remove(path);
    });

    it('should not crash for nested folders', async () => {
      const path = `${randomRootPath()}${randomRootPath()}`;

      expect(await client.exists(path)).toBe(false);
    });
  });

  describe('move(path, newName)', () => {
    it('should move simple files', async () => {
      const folder  = randomRootPath();
      const source  = randomRootPath();
      const renamed = randomRootPath().slice(1);

      const renamedPath = `/${folder}/${renamed}`;

      await client.touchFolder(folder);

      await client.put(source, '');

      expect(await client.exists(source)).toBeTruthy();

      await client.move(source, renamedPath);

      expect(await client.exists(source)).toBe(false);
      expect(await client.exists(renamedPath)).toBeTruthy();

      await client.remove(renamedPath);
    });

    it('should move folders', async () => {
      const folder  = randomRootPath();
      const source  = randomRootPath();
      const file    = randomRootPath();
      const renamed = randomRootPath().slice(1);

      const sourceFilePath    = `${source}${file}`;
      const renamedFolderPath = `${folder}/${renamed}`;

      const renamedPathFile = `${renamedFolderPath}${file}`;

      await client.touchFolder(folder);
      await client.touchFolder(source);

      await client.put(sourceFilePath, '');

      expect(await client.exists(source)).toBeTruthy();

      await client.move(source, renamedFolderPath);

      expect(await client.exists(source)).toBe(false);
      expect(await client.exists(renamedPathFile)).toBeTruthy();
      expect(await client.exists(renamedFolderPath)).toBeTruthy();

      await client.remove(renamedFolderPath);
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

      expect(await client.exists(path)).toBeTruthy();
      expect(await client.exists(file1)).toBeTruthy();
      expect(await client.exists(file2)).toBeTruthy();

      const files = await client.getFiles(path);

      expect(files.length).toBe(2);
      expect(files.includes(fileName1)).toBeTruthy();
      expect(files.includes(fileName2)).toBeTruthy();

      await client.remove(path);
    });
  });

  describe('getPathInfo(path, options)', () => {
    it('should return the path info', async () => {
      const path = randomRootPath();

      await client.touchFolder(path);

      const info = await client.getPathInfo(path);

      expect(`/${info.basename}`).toBe(path);
    });

    it('should return the path info with the given options', async () => {
      const path = randomRootPath();

      await client.touchFolder(path);

      const info = await client.getPathInfo(path, { details: true });

      expect(`/${info.data.basename}`).toBe(path);
    });

    it('should return the path info in nested folders', async () => {
      const path = `${randomRootPath()}${randomRootPath()}`;

      const dirName = 'dir1';
      const dir = `${path}/${dirName}`;

      await client.touchFolder(dir);

      const info = await client.getPathInfo(dir);

      expect(info.basename).toBe(dirName);
    })

  });

  describe('getFolderFileDetails(path)', () => {
    it('should retrieve lists of files in a given folder', async () => {
      const path = randomRootPath();

      const fileName1 = 'file1';
      const fileName2 = 'file2';
      const fileName3 = 'file3.txt';

      const file1 = `${path}/${fileName1}`;
      const file2 = `${path}/${fileName2}`;
      const file3 = `${path}/${fileName3}`;

      await client.touchFolder(file1);
      await client.put(file2, '');
      await client.put(file3, 'hello world');

      const files = await client.getFolderFileDetails(path);

      expect(files.length).toBe(3);

      expect(files[0].isFile).toBeFalsy();
      expect(files[0].name).toBe(fileName1);
      expect(files[0].isDirectory).toBeTruthy();
      expect(files[0].lastModified).toBeTruthy();
      expect(files[0].href).toBe(`/remote.php/dav/files/nextcloud${path}/${fileName1}`);

      expect(files[1].isFile).toBeTruthy();
      expect(files[1].name).toBe(fileName2);
      expect(files[1].isDirectory).toBeFalsy();
      expect(files[1].lastModified).toBeTruthy();
      expect(files[1].href).toBe(`/remote.php/dav/files/nextcloud${path}/${fileName2}`);

      expect(files[2].isFile).toBeTruthy();
      expect(files[2].name).toBe(fileName3);
      expect(files[2].isDirectory).toBeFalsy();
      expect(files[2].lastModified).toBeTruthy();
      expect(files[2].href).toBe(`/remote.php/dav/files/nextcloud${path}/${fileName3}`);

      await client.remove(path);
    });
  });

  describe('getFolderFileDetails(path)', () => {

    it('should retrieve the properties of a folder', async () => {
      const path = randomRootPath();

      await client.touchFolder(path);

      const properties = await client.getFolderProperties(path, [
        createDetailProperty('oc','fileid'),
        createDetailProperty('oc','size'),
        createDetailProperty('oc','owner-id')
      ]);

      expect(properties['oc:owner-id']).toBe('nextcloud');

      await client.remove(path);
    });
  });

  describe('getFilesDetailed(path)', () => {
    it('should retrieve lists of files in a given folder', async () => {
      const path = randomRootPath();
      const file1 = 'file1.txt';
      const file2 = 'file2.txt';
      const file3 = 'file3.txt';
      const dir1 = 'someDir';

      await client.touchFolder(path);

      await client.put(`${path}/${file1}`, '');
      await client.put(`${path}/${file2}`, '');
      await client.put(`${path}/${file3}`, '');

      await client.touchFolder(`${path}/${dir1}`);

      const files = await client.getFilesDetailed(path);

      expect(files.length).toBe(4);

      expect(files[0].type).toBe('file');
      expect(files[0].basename).toBe(file1);
      expect(files[0].size).toBe(0);
      expect(files[0].lastmod).toBeTruthy();
      expect(files[0].mime).toBe('text/plain');
      expect(files[0].etag).toBeTruthy();

      expect(files[1].type).toBe('file');
      expect(files[1].basename).toBe(file2);
      expect(files[1].size).toBe(0);
      expect(files[1].lastmod).toBeTruthy();
      expect(files[1].mime).toBe('text/plain');
      expect(files[1].etag).toBeTruthy();

      expect(files[2].type).toBe('file');
      expect(files[2].basename).toBe(file3);
      expect(files[2].size).toBe(0);
      expect(files[2].lastmod).toBeTruthy();
      expect(files[2].mime).toBe('text/plain');
      expect(files[2].etag).toBeTruthy();

      expect(files[3].type).toBe('directory');
      expect(files[3].basename).toBe(dir1);
      expect(files[3].size).toBe(0);

      await client.remove(path);
    });

    it('should retrieve lists of files in a given folder with extra properties', async () => {
      const path = randomRootPath();
      const file1 = 'file1.txt';

      await client.touchFolder(path);

      await client.put(`${path}/${file1}`, '');

      let files = await client.getFilesDetailed(path, {
        details: true,
        properties: [
          createDetailProperty('oc', 'fileid'),
          createDetailProperty('oc', 'size'),
          createDetailProperty('oc', 'owner-id'),
          createDetailProperty('oc', 'has-preview', false),
        ]
      });

      expect(files.data.length).toBe(1);

      expect(files.data[0].type).toBe('file');
      expect(files.data[0].basename).toBe(file1);
      expect(files.data[0].size).toBe(0);
      expect(files.data[0].lastmod).toBeTruthy();
      expect(files.data[0].mime).toBe('text/plain');
      expect(files.data[0].etag).toBeTruthy();
      expect(files.data[0].props['size']).toBe(0);
      expect(files.data[0].props['owner-id']).toBe('nextcloud');
      expect(files.data[0].props['has-preview']).toBe(false);
      expect(files.data[0].props['fileid']).toBeTruthy();

      await client.remove(path);
    });
  }),

  describe('file info', () => {
    const path = randomRootPath();
    const file1 = 'file1.txt';

    it('should retrieve extra properties when requested', async () => {
      await client.touchFolder(path);

      await client.put(`${path}/${file1}`, '');

      let folderDetails = await client.getFolderFileDetails(path, [
        createDetailProperty('oc', 'fileid'),
        createDetailProperty('oc', 'size'),
        createDetailProperty('oc', 'owner-id'),
        createDetailProperty('oc', 'has-preview', false),

        createDetailProperty('oc', 'test'),
        createDetailProperty('oc', 'test2', 42),
        createDetailProperty('oc', 'test3'),
        createDetailProperty('oc', 'test4', 37),
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

  describe('getReadStream(path)', () => {
    it('should be able to stream files off of Nextcloud instances', async () => {
      const string = 'test';
      const path   = randomRootPath();

      let data = '';

      await client.put(path, string);

      const stream = await client.getReadStream(path);

      stream.on('data', chunk => data += chunk.toString());

      await new Promise((resolve, reject) => {
        stream.once('end', resolve);
        stream.once('error', reject);
      });

      expect(data).toBe(string);

      await client.remove(path);
    });
  });

  describe('getWriteStream(path)', () => {
    it('should pipe readable streams to the Nextcloud instance', async () => {
      const string = 'test';
      const path   = randomRootPath();

      await new Promise(async (resolve) => {
        const stream = await client.getWriteStream(path, {
          overwrite: true,
          onFinished() {
            resolve(undefined);
          },
        });

        stream.write(string);
        stream.end();
      });

      expect(await client.get(path, { format: 'text' })).toBe(string);

      await client.remove(path);
    }, 10000);
  });

  describe('getWriteStreamCustom(path)', () => {
    it('should pipe readable streams to the Nextcloud instance', async () => {
      const string = 'test';
      const path   = randomRootPath();

      await new Promise(async (resolve, reject) => {
        const stream = await client.getWriteStream(path, {
          overwrite: true,
          onFinished() {
            resolve(undefined);
          },
        });

        stream.on('error', (err) => reject(err));

        stream.write(string);
        stream.end();
      });

      expect(await client.get(path, { format: 'text' })).toBe(string);

      await client.remove(path);
    }, 10000);
  });

  describe('uploadFromStream(targetPath, readStream)', () => {
    it('should pipe from readable streams to the Nextcloud instance', async () => {
      const string = 'test';
      const path   = randomRootPath();

      const readStream = getReadStream(string);

      await client.uploadFromStream(path, readStream);

      expect(await client.get(path, { format: 'text' })).toBe(string);

      await client.remove(path);
    });
  });


  describe('downloadToSream(sourcePath, writeStream)', () => {
    it('should pipe into provided writable streams from the Nextcloud instance', async () => {
      const path = randomRootPath();
      const string = 'test';
      const readStream = getReadStream(string);
      await client.uploadFromStream(path, readStream);

      const writeStream = getWriteStream();

      writeStream.on('testchunk', (...args) => {
        expect(args[0].toJSON()).toEqual({ data: [116, 101, 115, 116], type: 'Buffer' });
      });

      await client.downloadToStream(path, writeStream);

      await client.remove(path);
    });
  });

  describe('Path reservation', () => {
    it('should allow saving a file with empty contents, then getting a write stream for it immediately', async () => {
      const path = randomRootPath();

      await client.put(path, '');

      const writeStream = await client.getWriteStream(path);

      const writtenStream = getReadStream('test');

      const completionPromise = new Promise((resolve, reject) => {
        writeStream.on('end', resolve);
        writeStream.on('error', reject);
      });

      writtenStream.pipe(writeStream);

      await completionPromise;
    });
  });
});

function randomRootPath(): string {
  return `/${Math.floor(Math.random() * 1000000000)}`;
}

function getReadStream(string): Stream.Readable {
  let readStream = new Stream.Readable();

  readStream._read = () => {};

  readStream.push(string);
  readStream.push(null);

  return readStream;
}

function getWriteStream(): Stream.Writable {
  let writeStream = new Stream.Writable();

  writeStream._write = (chunk, _, done) => {
    writeStream.emit('testchunk', chunk);
    writeStream.emit('close');
    done();
  };

  return writeStream;
}
