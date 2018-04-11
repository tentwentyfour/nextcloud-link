import { promisify } from "util";
import * as Webdav   from "webdav-client";

import { NextcloudClientData, ConnectionOptions }          from "./types";
import { NotConnectedError, NotFoundError, NotReadyError } from "./errors";

const promisifiedPut     = promisify(Webdav.Connection.prototype.put);
const promisifiedExists  = promisify(Webdav.Connection.prototype.exists);
const promisifiedReaddir = promisify(Webdav.Connection.prototype.readdir);

export interface WebdavClient {
  configureConnection(options: ConnectionOptions): void;
}

export function configureConnection(options: ConnectionOptions): void {
  const self: NextcloudClientData = this;

  this.webdavConnection = new Webdav.Connection({
    url:           `${options.url}/remote.php/dav/files/nextcloud`,
    authenticator: new Webdav.BasicAuthenticator(),
    username:      options.username,
    password:      options.password
  });
}

async exists(path) {
 return promisifiedExists.call(this.webdavConnection, path);
}

@translateErrors
async put(path, content = "") {
 await promisifiedPut.call(this.webdavConnection, path, content);
}

@translateErrors
async getFiles(path) {
 const files = await promisifiedReaddir.call(this.webdavConnection);

 if (!Array.isArray(files)) {
   throw new NotReadyError;
 }

 return files;
}

async checkConnectivity() {
 try           { await this.getFiles("/"); }
 catch (error) { return false;             }

 return true;
}

function translateErrors(WebdavClient: any, methodName: string) {
  const λ = WebdavClient.prototype[methodName];

  WebdavClient.prototype[methodName] = async function errorTranslator(...parameters) {
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
