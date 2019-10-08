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
  getCreatorByFileId,
  getCreatorByPath,
} from './common';

import {
  addRemoveUserSubAdminForGroup,
  configureOcsConnection,
  resendUserWelcomeEmail,
  addRemoveUserForGroup,
  getGroupSubAdmins,
  getUserSubAdmins,
  setUserEnabled,
  getActivities,
  getGroupUsers,
  getUserGroups,
  deleteGroup,
  deleteShare,
  deleteUser,
  listGroups,
  editShare,
  getShares,
  listUsers,
  addGroup,
  addShare,
  editUser,
  getShare,
  getUser,
  addUser,
} from './ocs/ocs';

import {
  OcsSharePermissions,
  OcsEditUserField,
  OcsShareType,
  OcsNewUser,
  OcsUser,
} from './ocs/types';

import {
  NextcloudClientProperties,
  NextcloudClientInterface,
  ConnectionOptions,
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
  getCreatorByFileId          = getCreatorByFileId;
  getCreatorByPath            = getCreatorByPath;

  // OCS
  activities = {
    get                     : (fileId: number | string, sort?: 'asc' | 'desc',
    limit?: number, sinceActivityId?: number)  => getActivities(this.ocsConnection, fileId, sort, limit, sinceActivityId)
  };

  users = {
    removeSubAdminFromGroup : (userId: string, groupId: string) => addRemoveUserSubAdminForGroup(this.ocsConnection, userId, groupId, false),
    addSubAdminToGroup      : (userId: string, groupId: string) => addRemoveUserSubAdminForGroup(this.ocsConnection, userId, groupId, true),
    resendWelcomeEmail      : (userId: string) => resendUserWelcomeEmail(this.ocsConnection, userId),
    removeFromGroup         : (userId: string, groupId: string) => addRemoveUserForGroup(this.ocsConnection, userId, groupId, false),
    getSubAdmins            : (userId: string) => getUserSubAdmins(this.ocsConnection, userId),
    setEnabled              : (userId: string, isEnabled: boolean) => setUserEnabled(this.ocsConnection, userId, isEnabled),
    addToGroup              : (userId: string, groupId: string) => addRemoveUserForGroup(this.ocsConnection, userId, groupId, true),
    getGroups               : (userId: string) => getUserGroups(this.ocsConnection, userId),
    delete                  : (userId: string) => deleteUser(this.ocsConnection, userId),
    edit                    : (userId: string, field: OcsEditUserField, value: string) => editUser(this.ocsConnection, userId, field, value),
    list                    : (search?: string, limit?: number, offset?: number) => listUsers(this.ocsConnection, search, limit, offset),
    add                     : (user: OcsNewUser) => addUser(this.ocsConnection, user),
    get                     : (userId: string) => getUser(this.ocsConnection, userId),
  };

  groups = {
    getSubAdmins            : (groupId: string) => getGroupSubAdmins(this.ocsConnection, groupId),
    getUsers                : (groupId: string) => getGroupUsers(this.ocsConnection, groupId),
    delete                  : (groupId: string) => deleteGroup(this.ocsConnection, groupId),
    list                    : (search?: string, limit?: number, offset?: number) => listGroups(this.ocsConnection, search, limit, offset),
    add                     : (groupId: string) => addGroup(this.ocsConnection, groupId),
  };

  shares = {
    delete                  : (shareId: number | string) => deleteShare(this.ocsConnection, shareId),
    edit: {
      permissions           : (shareId: number | string, permissions: OcsSharePermissions) => editShare(this.ocsConnection, shareId).permissions(permissions),
      password              : (shareId: number | string, password: string) => editShare(this.ocsConnection, shareId).password(password),
      // publicUpload          : (shareId: number | string, isPublicUpload: boolean) => editShare(this.ocsConnection, shareId).publicUpload(isPublicUpload),
      expireDate            : (shareId: number | string, expireDate: string) => editShare(this.ocsConnection, shareId).expireDate(expireDate),
      note                  : (shareId: number | string, note: string) => editShare(this.ocsConnection, shareId).note(note),
    },
    list                    : (path?: string, includeReshares?: boolean, showForSubFiles?: boolean) => getShares(this.ocsConnection, path, includeReshares, showForSubFiles),
    add                     : (path: string, shareType: OcsShareType, shareWith?: string, permissions?: OcsSharePermissions,
    password?: string)/*, publicUpload?: boolean)*/ => addShare(this.ocsConnection, path, shareType, shareWith, permissions, password)/*, publicUpload)*/,
    get                     : (shareId: number | string) => getShare(this.ocsConnection, shareId),
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
