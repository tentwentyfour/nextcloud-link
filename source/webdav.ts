import * as Webdav   from "webdav-client";
import * as Stream   from "stream";
import { promisify } from "util";

import {
  NextcloudClientInterface,
  ConnectionOptions,
  AsyncFunction
} from "./types";

import {
  Exception as NextcloudError,

  NotConnectedError,
  ForbiddenError,
  NotFoundError,
  NotReadyError
} from "./errors";

const promisifiedPut       = promisify(Webdav.Connection.prototype.put);
const promisifiedGet       = promisify(Webdav.Connection.prototype.get);
const promisifiedMove      = promisify(Webdav.Connection.prototype.move);
const promisifiedMkdir     = promisify(Webdav.Connection.prototype.mkdir);
const promisifiedExists    = promisify(Webdav.Connection.prototype.exists);
const promisifiedDelete    = promisify(Webdav.Connection.prototype.delete);
const promisifiedReaddir   = promisify(Webdav.Connection.prototype.readdir);
const promisifiedPreStream = promisify(Webdav.Connection.prototype.prepareForStreaming);

export function configureWebdavConnection(options: ConnectionOptions): void {
  const self: NextcloudClientInterface = this;

  self.webdavConnection = new Webdav.Connection({
    authenticator: new Webdav.BasicAuthenticator(),
    url:           nextcloudRoot(options.url),
    username:      options.username,
    password:      options.password
  });
}

export const getReadStream = translateErrors(async function getReadStream(path: string): Promise<Stream.Readable> {
  const self: NextcloudClientInterface = this;

  await promisifiedPreStream.call(self.webdavConnection, path);

  return self.webdavConnection.get(path) as Stream.Readable;
});

export const remove = translateErrors(async function remove(path: string): Promise<void> {
  const self: NextcloudClientInterface = this;

  await promisifiedDelete.call(self.webdavConnection, path);
});

export const exists = translateErrors(async function exists(path: string): Promise<boolean> {
  const self: NextcloudClientInterface = this;

  const paths = unnest(path);

  for (const path of paths) {
    if (!await promisifiedExists.call(self.webdavConnection, path)) {
      return false;
    }
  }

  return true;
});

export const put = translateErrors(async function put(path: string, content: string): Promise<void> {
  const self: NextcloudClientInterface = this;

  await promisifiedPut.call(self.webdavConnection, path, content);
});

export const get = translateErrors(async function get(path: string): Promise<string> {
  const self: NextcloudClientInterface = this;

  return await promisifiedGet.call(self.webdavConnection, path);
});

export const getFiles = translateErrors(async function getFiles(path: string): Promise<[string]> {
  const self: NextcloudClientInterface = this;

  const files: [string] = await promisifiedReaddir.call(self.webdavConnection, path);

  if (!Array.isArray(files)) {
    throw new NotReadyError;
  }

  return files;
});

export const rename = translateErrors(async function rename(from: string, to: string): Promise<void> {
  const self: NextcloudClientInterface = this;

  const override = true;
  const base     = from.slice(0, from.lastIndexOf("/") + 1);

  const fullDestinationPath = `${nextcloudRoot(self.url)}${base}${to}`;

  await promisifiedMove.call(self.webdavConnection, from, fullDestinationPath, override);
});

export async function checkConnectivity(): Promise<boolean> {
  const self: NextcloudClientInterface = this;

  try           { await self.getFiles("/"); }
  catch (error) { return false;             }

  return true;
}

export const getWriteStream = translateErrors(async function getWriteStream(path: string): Promise<Stream.Writable> {
  const self: NextcloudClientInterface = this;

  await preWriteStream.call(self, path);

  return await self.webdavConnection.put(path) as Stream.Writable;
});

export const touchFolder = translateErrors(async function touchFolder(path: string): Promise<void> {
  const self: NextcloudClientInterface = this;

  if (!await self.exists(path)) {
    await promisifiedMkdir.call(self.webdavConnection, path);
  }
});

export const createFolderHierarchy = translateErrors(async function createFolderHierarchy(path: string): Promise<void> {
  const self: NextcloudClientInterface = this;

  const paths = unnest(path);

  for (const path of paths) {
    await self.touchFolder(path);
  }
});

export const pipeStream = translateErrors(async function writeStream(path: string, stream: Stream): Promise<void> {
  const self: NextcloudClientInterface = this;

  const writeStream = await self.getWriteStream(path);

  await new Promise((resolve, reject) => {
    stream.on("error", wrapError);
    writeStream.on("end", resolve);
    writeStream.on("error", wrapError);

    stream.pipe(writeStream);

    function wrapError(error) {
      reject(NextcloudError(error));
    }
  });
});

async function preWriteStream(path: string): Promise<void> {
  const self: NextcloudClientInterface = this;

  await promisifiedPut.call(self.webdavConnection, path, "");

  await promisifiedPreStream.call(self.webdavConnection, path);
}

function translateErrors<T extends AsyncFunction>(λ: T): T {
  return async function errorTranslator(...parameters) {
    // This assumes the first parameter will always be the path.
    const path = parameters[0];

    try {
      return await λ.apply(this, parameters);
    } catch (error) {
      if (error.statusCode) {
        if (error.statusCode === 404) {
          throw new NotFoundError(path);
        } else if (error.statusCode === 403) {
          throw new ForbiddenError(path);
        }
      }

      throw error;
    }
  } as T;
}

function unnest(path) {
  return path
  .slice(1)
  .split("/")
  .map((folder, position, folders) => `/${folders.slice(0, position + 1).join("/")}`);
}

function nextcloudRoot(url) {
  return `${url}/remote.php/dav/files/nextcloud`;
}
