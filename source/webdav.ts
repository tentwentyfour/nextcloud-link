import { promisify } from 'util';
import * as Webdav   from 'webdav-client';
import * as Stream   from 'stream';

import {
  NextcloudClientInterface,
  ConnectionOptions,
  FileDetails,
  FileDetailProperty
} from './types';

import {
  clientFunction
} from './helper';

import {
  Exception as NextcloudError,

  NotReadyError
} from './errors';

const sanitizePath = encodeURI;

const promisifiedPut       = promisify(Webdav.Connection.prototype.put);
const promisifiedGet       = promisify(Webdav.Connection.prototype.get);
const promisifiedMove      = promisify(Webdav.Connection.prototype.move);
const promisifiedMkdir     = promisify(Webdav.Connection.prototype.mkdir);
const promisifiedExists    = promisify(Webdav.Connection.prototype.exists);
const promisifiedDelete    = promisify(Webdav.Connection.prototype.delete);
const promisifiedReaddir   = promisify(Webdav.Connection.prototype.readdir);
const promisifiedPreStream = promisify(Webdav.Connection.prototype.prepareForStreaming);

async function rawGetReadStream(sanePath: string): Promise<Webdav.Stream> {
  const self: NextcloudClientInterface = this;

  await promisifiedPreStream.call(self.webdavConnection, sanePath);

  return await self.webdavConnection.get(sanePath);
}

async function rawRemove(sanePath: string): Promise<void> {
  const self: NextcloudClientInterface = this;

  await promisifiedDelete.call(self.webdavConnection, sanePath);
}

async function rawExists(sanePath: string): Promise<boolean> {
  const self: NextcloudClientInterface = this;

  const paths = unnest(sanePath);

  for (const sanePath of paths) {
    if (!await promisifiedExists.call(self.webdavConnection, sanePath)) {
      return false;
    }
  }

  return true;
}

async function rawPut(sanePath: string, content: Webdav.ContentType): Promise<void> {
  const self: NextcloudClientInterface = this;

  await promisifiedPut.call(self.webdavConnection, sanePath, content);
}

async function rawGet(sanePath: string): Promise<string> {
  const self: NextcloudClientInterface = this;

  return await promisifiedGet.call(self.webdavConnection, sanePath);
}

async function rawGetFiles(sanePath: string): Promise<string[]> {
  const self: NextcloudClientInterface = this;

  const files: string[] = await promisifiedReaddir.call(self.webdavConnection, sanePath);

  if (!Array.isArray(files)) {
    throw new NotReadyError;
  }

  return files;
}

async function rawGetFolderFileDetails(sanePath: string, extraProperties?: FileDetailProperty[]): Promise<FileDetails[]> {
  const self: NextcloudClientInterface = this;

  const options = {
    properties: true
  };

  if (extraProperties && extraProperties.length > 0) {
    options['extraProperties'] = [...extraProperties];
  }

  const files: FileDetails[] = await promisifiedReaddir.call(self.webdavConnection, sanePath, options);

  if (!Array.isArray(files)) {
    throw new NotReadyError;
  }

  return files;
}

async function rawRename(saneFrom: string, newName: string): Promise<void> {
  const self: NextcloudClientInterface = this;

  const override = true;
  const base     = saneFrom.slice(0, saneFrom.lastIndexOf('/') + 1);

  const fullDestinationPath = `${nextcloudRoot(self.url, self.username)}${base}${sanitizePath(newName)}`;

  await promisifiedMove.call(self.webdavConnection, saneFrom, fullDestinationPath, override);
}

async function rawMove(saneFrom: string, toPath: string): Promise<void> {
  const self: NextcloudClientInterface = this;

  const fullDestinationPath = `${nextcloudRoot(self.url, self.username)}${sanitizePath(toPath)}`;
  const override            = true;

  await promisifiedMove.call(self.webdavConnection, saneFrom, fullDestinationPath, override);
}

async function rawGetWriteStream(sanePath: string): Promise<Webdav.Stream> {
  const self: NextcloudClientInterface = this;

  await preWriteStream.call(self, sanePath);


  return await self.webdavConnection.put(sanePath);
}

async function rawTouchFolder(sanePath: string): Promise<void> {
  const self: NextcloudClientInterface = this;

  if (!await rawExists.call(self, sanePath)) {
    await promisifiedMkdir.call(self.webdavConnection, sanePath);
  }
}

async function rawCreateFolderHierarchy(sanePath: string): Promise<void> {
  const self: NextcloudClientInterface = this;

  const paths = unnest(sanePath);

  for (const saneSubfolder of paths) {
    await rawTouchFolder.call(self, saneSubfolder);
  }
}

export function configureWebdavConnection(options: ConnectionOptions): void {
  const self: NextcloudClientInterface = this;

  self.webdavConnection = new Webdav.Connection({
    url:           nextcloudRoot(options.url, options.username),
    authenticator: new Webdav.BasicAuthenticator(),
    username:      options.username,
    password:      options.password
  });
}

export async function checkConnectivity(): Promise<boolean> {
  const self: NextcloudClientInterface = this;

  try           { await rawGetFiles.call(self, '/'); }
  catch (error) { return false;                      }

  return true;
}

async function rawPipeStream(sanePath: string, stream: Stream): Promise<void> {
  const self: NextcloudClientInterface = this;

  const writeStream = await rawGetWriteStream.call(self, sanePath);

  await new Promise((resolve, reject) => {
    stream.on('error', wrapError);
    writeStream.on('end', resolve);
    writeStream.on('error', wrapError);

    stream.pipe(writeStream);

    function wrapError(error) {
      reject(NextcloudError(error));
    }
  });
}

export const createFolderHierarchy = clientFunction(rawCreateFolderHierarchy);
export const getFolderFileDetails  = clientFunction(rawGetFolderFileDetails);
export const getWriteStream        = clientFunction(rawGetWriteStream);
export const getReadStream         = clientFunction(rawGetReadStream);
export const touchFolder           = clientFunction(rawTouchFolder);
export const pipeStream            = clientFunction(rawPipeStream);
export const getFiles              = clientFunction(rawGetFiles);
export const rename                = clientFunction(rawRename);
export const remove                = clientFunction(rawRemove);
export const move                  = clientFunction(rawMove);
export const exists                = clientFunction(rawExists);
export const put                   = clientFunction(rawPut);
export const get                   = clientFunction(rawGet);

async function preWriteStream(sanitizedPath: string): Promise<void> {
  const self: NextcloudClientInterface = this;

  await promisifiedPut.call(self.webdavConnection, sanitizedPath, '');

  await promisifiedPreStream.call(self.webdavConnection, sanitizedPath);
}

function unnest(path) {
  return path
  .slice(1)
  .split('/')
  .map((folder, position, folders) => `/${folders.slice(0, position + 1).join('/')}`);
}

function nextcloudRoot(url, username) {
  const lastUrlCharacterIsSlash = url.slice(-1)[0] === '/';

  const terminatedUrl = lastUrlCharacterIsSlash ? url : `${url}/`;

  return `${terminatedUrl}remote.php/dav/files/${username}`;
}
