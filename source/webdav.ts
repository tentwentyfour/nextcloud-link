import * as Webdav   from "webdav-client";
import { promisify } from "util";

import { NextcloudClientInterface, ConnectionOptions, ReadStream, WriteStream }         from "./types";
import { NotConnectedError, NotFoundError, NotReadyError, Exception as NextcloudError } from "./errors";

const promisifiedPut       = promisify(Webdav.Connection.prototype.put);
const promisifiedMkdir     = promisify(Webdav.Connection.prototype.mkdir);
const promisifiedExists    = promisify(Webdav.Connection.prototype.exists);
const promisifiedDelete    = promisify(Webdav.Connection.prototype.delete);
const promisifiedReaddir   = promisify(Webdav.Connection.prototype.readdir);
const promisifiedPreStream = promisify(Webdav.Connection.prototype.prepareForStreaming);

export function configureWebdavConnection(options: ConnectionOptions): void {
  const self: NextcloudClientInterface = this;

  self.webdavConnection = new Webdav.Connection({
    url:           `${options.url}/remote.php/dav/files/nextcloud`,
    authenticator: new Webdav.BasicAuthenticator(),
    username:      options.username,
    password:      options.password
  });
}

export const getReadStream = translateErrors(async function getReadStream(path: String): Promise<ReadStream> {
  const self: NextcloudClientInterface = this;

  await promisifiedPreStream.call(self.webdavConnection, path);

  return this.webdavConnection.get(path);
});

export const removeFile = translateErrors(async function removeFile(path: String): Promise<void> {
  const self: NextcloudClientInterface = this;

  await promisifiedDelete.call(self.webdavConnection, path);
});

export const exists = translateErrors(async function exists(path: String): Promise<boolean> {
  const self: NextcloudClientInterface = this;

  return promisifiedExists.call(self.webdavConnection, path);
});

export const put = translateErrors(async function put(path: string, content: string): Promise<void> {
  const self: NextcloudClientInterface = this;

  await promisifiedPut.call(self.webdavConnection, path, content);
});

export const getFiles = translateErrors(async function getFiles(path: String): Promise<[string]> {
  const self: NextcloudClientInterface = this;

  const files: [string] = await promisifiedReaddir.call(self.webdavConnection);

  if (!Array.isArray(files)) {
    throw new NotReadyError;
  }

  return files;
});

export const checkConnectivity = translateErrors(async function checkConnectivity(): Promise<boolean> {
  const self: NextcloudClientInterface = this;

  try           { await self.getFiles("/"); }
  catch (error) { return false;             }

  return true;
});

export const getWriteStream = translateErrors(async function getWriteStream(path: String): Promise<WriteStream> {
  const self: NextcloudClientInterface = this;

  await preWriteStream.call(self, path);

  return this.private.getWriteStream(path);
});

export const touchFolder = translateErrors(async function touchFolder(path: String): Promise<void> {
  const self: NextcloudClientInterface = this;

  if (!await this.exists(path)) {
    await promisifiedMkdir.call(this.webdavConnection, path);
  }
});

export const createFolderHierarchy = translateErrors(async function createFolderHierarchy(path: String): Promise<void> {
  const self: NextcloudClientInterface = this;

  // Transforms each folder name into its path.
  const paths = path
  .split("/")
  .map((folder, position, folders) => folders.slice(0, position + 1).join("/"));

  for (const path of paths) {
    await self.touchFolder(path);
  }
});

export const pipeStream = translateErrors(async function writeStream(path: String, stream: ReadStream): Promise<void> {
  const self: NextcloudClientInterface = this;

  const writeStream = await this.getWriteStream(path);

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

async function preWriteStream(path: String): Promise<void> {
  const self: NextcloudClientInterface = this;

  await self.put(path, "");

  await promisifiedPreStream.call(self.webdavConnection, path);
}

function translateErrors(λ) {
  return async function errorTranslator(...parameters) {
    // This assumes the first parameter will always be the path.
    const path = parameters[0];

    try {
      return await λ.call(this, parameters);
    } catch (error) {
      if (error instanceof Webdav.HTTPError) {
        if (error.statusCode === 404) {
          throw new NotFoundError(path);
        }
      }

      throw error;
    }
  };
}
