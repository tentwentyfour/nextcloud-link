import * as Webdav from 'webdav-client';
import * as Stream from 'stream';


import {
  configureWebdavConnection,
  createFolderHierarchy,
  getFolderFileDetails,
  getFolderProperties,
  checkConnectivity,
  getWriteStream,
  getReadStream,
  touchFolder,
  pipeStream,
  getFiles,
  rename,
  remove,
  exists,
  move,
  put,
  get
} from './webdav';

import {
  getFileOrFolderCreator,
  getObjectCreator
} from './common';

import {
  configureOcsConnection,
  getActivities,
  getUser,
} from './ocs/ocs';

import {
  OcsUser
} from './ocs/types';

import {
  ConnectionOptions,
  NextcloudClientInterface,
  NextcloudClientProperties,
  AsyncFunction
} from './types';
import OcsConnection from './ocs/ocs-connection';

export class NextcloudClient extends NextcloudClientProperties implements NextcloudClientInterface {
  configureWebdavConnection = configureWebdavConnection;
  configureOcsConnection    = configureOcsConnection;
  createFolderHierarchy     = createFolderHierarchy;
  getFolderFileDetails      = getFolderFileDetails;
  getFolderProperties       = getFolderProperties;
  checkConnectivity         = checkConnectivity;
  getWriteStream            = getWriteStream;
  getReadStream             = getReadStream;
  touchFolder               = touchFolder;
  pipeStream                = pipeStream;
  getFiles                  = getFiles;
  rename                    = rename;
  remove                    = remove;
  exists                    = exists;
  move                      = move;
  put                       = put;
  get                       = get;

  // Common
  getFileOrFolderCreator    = getFileOrFolderCreator;
  getObjectCreator          = getObjectCreator;

  // OCS
  activities = {
    get                     : (objectId: number | string, sort?: 'asc' | 'desc',
    limit?: number, sinceActivityId?: number)  => getActivities(this.ocsConnection, objectId, sort, limit, sinceActivityId)
  };

  users = {
    get                     : (userId: string) => getUser(this.ocsConnection, userId)
  };

  constructor(options: ConnectionOptions) {
    super();

    this.username = options.username;
    this.url      = options.url.endsWith('/') ? options.url.slice(0, -1) : options.url;

    this.configureWebdavConnection(options);
    this.configureOcsConnection(options);
  }

  as(username: string, password: string): NextcloudClient {
    return new NextcloudClient({ username, password, url: this.url });
  }
}

// Shush, Typescript…
export default NextcloudClient;

// Support default import syntax for Node and TS, and also a named export.
module.exports = Object.assign(NextcloudClient, { NextcloudClient, default: NextcloudClient });
