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
  getCreatorByPath,
  getCreatorByFileId
} from './common';

import {
  configureOcsConnection,
  addRemoveUserForGroup,
  addRemoveUserSubAdminForGroup,
  setUserEnabled,
  getActivities,
  getUserGroups,
  deleteUser,
  listUsers,
  editUser,
  getUser,
  addUser,
  listGroups,
  addGroup,
  deleteGroup,
  getGroupUsers,
  getGroupSubAdmins,
} from './ocs/ocs';

import {
  OcsUser,
  OcsNewUser,
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
  getCreatorByPath            = getCreatorByPath;
  getCreatorByFileId          = getCreatorByFileId;

  // OCS
  activities = {
    get                     : (fileId: number | string, sort?: 'asc' | 'desc',
    limit?: number, sinceActivityId?: number)  => getActivities(this.ocsConnection, fileId, sort, limit, sinceActivityId)
  };

  users = {
    get                     : (userId: string) => getUser(this.ocsConnection, userId),
    addSubAdminToGroup: (userId: string, groupId: string) => addRemoveUserSubAdminForGroup(this.ocsConnection, userId, groupId, true),
    removeSubAdminFromGroup    : (userId: string, groupId: string) => addRemoveUserSubAdminForGroup(this.ocsConnection, userId, groupId, false),
    setEnabled              : (userId: string, isEnabled: boolean) => setUserEnabled(this.ocsConnection, userId, isEnabled),
    addToGroup              : (userId: string, groupId: string) => addRemoveUserForGroup(this.ocsConnection, userId, groupId, true),
    removeFromGroup: (userId: string, groupId: string) => addRemoveUserForGroup(this.ocsConnection, userId, groupId, false),
    getGroups               : (userId: string) => getUserGroups(this.ocsConnection, userId),
    delete                  : (userId: string) => deleteUser(this.ocsConnection, userId),
    list                    : () => listUsers(this.ocsConnection),
    edit                    : () => editUser(this.ocsConnection),
    add                     : (user: OcsNewUser) => addUser(this.ocsConnection, user),
  };

  groups = {
    list                    : (search?: string, limit?: number, offset?: number) => listGroups(this.ocsConnection, search, limit, offset),
    add                     : (groupId: string) => addGroup(this.ocsConnection, groupId),
    delete                  : (groupId: string) => deleteGroup(this.ocsConnection, groupId),
    getUsers                : (groupId: string) => getGroupUsers(this.ocsConnection, groupId),
    getSubAdmins            : (groupId: string) => getGroupSubAdmins(this.ocsConnection, groupId),
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
