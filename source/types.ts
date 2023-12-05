import { OcsConnection }        from './ocs/ocs-connection';
import { WebDavClient }         from './webdav';

import {
  OcsShareType,
  OcsSharePermissions,
  type OcsEditUserField,
  type OcsGroupfolder,
  type OcsActivity,
  type OcsNewUser,
  type OcsShare,
  type OcsUser,
} from './ocs/types';
import { Optional } from 'lonad';

export * from './ocs/types';

export type AsyncFunction       = (...parameters: any[]) => Promise<any>;
export class NextcloudClientProperties {
  webdavConnection: Optional<WebDavClient>;
  ocsConnection:    OcsConnection;
  username:         string;
  url:              string;
}

export interface NextcloudClientInterface extends NextcloudClientProperties {
  as(username: string, password: string): NextcloudClientInterface;
  get:                                                                        WebDavClient['get'];
  put:                                                                        WebDavClient['put'];
  move:                                                                       WebDavClient['move'];
  remove:                                                                     WebDavClient['remove'];
  exists:                                                                     WebDavClient['exists'];
  rename:                                                                     WebDavClient['rename'];
  getFiles:                                                                   WebDavClient['getFiles'];
  getPathInfo:                                                                WebDavClient['getPathInfo'];
  touchFolder:                                                                WebDavClient['touchFolder'];
  getReadStream:                                                              WebDavClient['getReadStream'];
  getWriteStream:                                                             WebDavClient['getWriteStream'];
  uploadFromStream:                                                           WebDavClient['uploadFromStream'];
  downloadToStream:                                                           WebDavClient['downloadToStream'];
  checkConnectivity:                                                          WebDavClient['checkConnectivity'];
  getFolderProperties:                                                        WebDavClient['getFolderProperties'];
  getFolderFileDetails:                                                       WebDavClient['getFolderFileDetails'];
  createFolderHierarchy:                                                      WebDavClient['createFolderHierarchy'];


  // Common
  getCreatorByFileId(fileId: number | string):                                Promise<string>;
  getCreatorByPath(path: string):                                             Promise<string>;

  // OCS
  activities: {
    get: (fileId: number | string, sort?: 'asc' | 'desc',
    limit?: number, sinceActivityId?: number) =>                              Promise<OcsActivity[]>
  };
  users: {
    removeSubAdminFromGroup: (userId: string, groupId: string) =>             Promise<boolean>
    addSubAdminToGroup: (userId: string, groupId: string) =>                  Promise<boolean>
    resendWelcomeEmail: (userId: string) =>                                   Promise<boolean>
    getSubAdminGroups: (userId: string) =>                                    Promise<string[]>
    removeFromGroup: (userId: string, groupId: string) =>                     Promise<boolean>
    setEnabled: (userId: string, isEnabled: boolean) =>                       Promise<boolean>
    addToGroup: (userId: string, groupId: string) =>                          Promise<boolean>
    getGroups: (userId: string) =>                                            Promise<string[]>
    delete: (userId: string) =>                                               Promise<boolean>
    edit: (userId: string, field: OcsEditUserField, value: string) =>         Promise<boolean>
    list: (search?: string, limit?: number, offset?: number) =>               Promise<string[]>
    add: (user: OcsNewUser) =>                                                Promise<boolean>
    get: (userId: string) =>                                                  Promise<OcsUser>
  };

  groups: {
    getSubAdmins: (groupId: string) =>                                        Promise<string[]>
    getUsers: (groupId: string) =>                                            Promise<string[]>
    delete: (groupId: string) =>                                              Promise<boolean>
    list: (search?: string, limit?: number, offset?: number) =>               Promise<string[]>
    add: (groupId: string) =>                                                 Promise<boolean>
  };

  shares: {
    delete: (shareId: string | number) =>                                     Promise<boolean>
    edit: {
      permissions: (shareId: string | number,
      permissions: OcsSharePermissions) =>                                    Promise<OcsShare>
      password: (shareId: string | number,
      password: string) =>                                                    Promise<OcsShare>
      publicUpload: (shareId: string | number,
      isPublicUpload: boolean) =>                                             Promise<OcsShare>
      expireDate: (shareId: string | number,
      expireDate: string) =>                                                  Promise<OcsShare>
      note: (shareId: string | number, note: string) =>                       Promise<OcsShare>
    }
    list: (path?: string, includeReshares?: boolean,
    showForSubFiles?: boolean) =>                                             Promise<OcsShare[]>
    add: (path: string, shareType: OcsShareType, shareWith?: string,
      permissions?: OcsSharePermissions, password?: string,
      publicUpload?: boolean) =>                                              Promise<OcsShare>
    get: (shareId: string | number) =>                                        Promise<OcsShare>
  };

  groupfolders: {
    getFolders: () => Promise<OcsGroupfolder[]>
    getFolder: (fid: number) => Promise<OcsGroupfolder>
    addFolder: (mountpoint: string) => Promise<number>
    removeFolder: (fid: number) => Promise<boolean>
    addGroup: (fid: number, gid: string) => Promise<boolean>
    removeGroup: (fid: number, gid: string) => Promise<boolean>
    setPermissions: (fid: number, gid: string, permissions: number) => Promise<boolean>
    enableACL: (fid: number, enable: boolean) => Promise<boolean>
    setManageACL: (fid: number, type: 'group' | 'user', id: string, manageACL: boolean) => Promise<boolean>
    setQuota: (fid: number, quota: number) => Promise<boolean>
    renameFolder: (fid: number, mountpoint: string) => Promise<boolean>
  };
}

export interface ConnectionOptions {
  url:       string;
  username?: string;
  password?: string;
}
