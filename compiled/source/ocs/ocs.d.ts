import { OcsConnection } from './ocs-connection';
import { OcsSharePermissions, OcsEditUserField, OcsGroupfolder, OcsShareType, OcsActivity, OcsNewUser, OcsShare, OcsUser } from './types';
import { ConnectionOptions } from '../types';
export declare function configureOcsConnection(options: ConnectionOptions): void;
export declare function getActivities(connection: OcsConnection, fileId: number | string, sort?: 'asc' | 'desc', limit?: number, sinceActivityId?: number): Promise<OcsActivity[]>;
export declare function getUser(connection: OcsConnection, userId: string): Promise<OcsUser>;
export declare function setUserEnabled(connection: OcsConnection, userId: string, isEnabled: boolean): Promise<boolean>;
export declare function editUser(connection: OcsConnection, userId: string, field: OcsEditUserField, value: string): Promise<boolean>;
export declare function getUserGroups(connection: OcsConnection, userId: string): Promise<string[]>;
export declare function getUserSubAdmins(connection: OcsConnection, userId: string): Promise<string[]>;
export declare function resendUserWelcomeEmail(connection: OcsConnection, userId: string): Promise<boolean>;
export declare function addRemoveUserForGroup(connection: OcsConnection, userId: string, groupId: string, toAdd: boolean): Promise<boolean>;
export declare function addRemoveUserSubAdminForGroup(connection: OcsConnection, userId: string, groupId: string, toAdd: boolean): Promise<boolean>;
export declare function listUsers(connection: OcsConnection, search?: string, limit?: number, offset?: number): Promise<string[]>;
export declare function deleteUser(connection: OcsConnection, userId: string): Promise<boolean>;
export declare function addUser(connection: OcsConnection, user: OcsNewUser): Promise<boolean>;
export declare function listGroups(connection: OcsConnection, search?: string, limit?: number, offset?: number): Promise<string[]>;
export declare function addGroup(connection: OcsConnection, groupId: string): Promise<boolean>;
export declare function deleteGroup(connection: OcsConnection, groupId: string): Promise<boolean>;
export declare function getGroupUsers(connection: OcsConnection, groupId: string): Promise<string[]>;
export declare function getGroupSubAdmins(connection: OcsConnection, groupId: string): Promise<string[]>;
export declare function getShares(connection: OcsConnection, path?: string, includeReshares?: boolean, showForSubFiles?: boolean): Promise<OcsShare[]>;
export declare function getShare(connection: OcsConnection, shareId: number | string): Promise<OcsShare>;
export declare function deleteShare(connection: OcsConnection, shareId: number | string): Promise<boolean>;
export declare function addShare(connection: OcsConnection, path: string, shareType: OcsShareType, shareWith?: string, permissions?: OcsSharePermissions, password?: string, publicUpload?: boolean): Promise<OcsShare>;
export declare function editShare(connection: OcsConnection, shareId: number | string): {
    permissions(permissions: OcsSharePermissions): Promise<OcsShare>;
    password(password: string): Promise<OcsShare>;
    publicUpload(isPublicUpload: boolean): Promise<OcsShare>;
    expireDate(expireDate: string): Promise<OcsShare>;
    note(note: string): Promise<OcsShare>;
};
export declare function getGroupfolders(connection: OcsConnection): Promise<OcsGroupfolder[]>;
export declare function getGroupfolder(connection: OcsConnection, groupfolderId: number): Promise<OcsGroupfolder>;
export declare function addGroupfolder(connection: OcsConnection, mountpoint: string): Promise<number>;
export declare function removeGroupfolder(connection: OcsConnection, groupfolderId: number): Promise<boolean>;
export declare function addGroupfolderGroup(connection: OcsConnection, groupfolderId: number, groupId: string): Promise<boolean>;
export declare function removeGroupfolderGroup(connection: OcsConnection, groupfolderId: number, groupId: string): Promise<boolean>;
export declare function setGroupfolderPermissions(connection: OcsConnection, groupfolderId: number, groupId: string, permissions: number): Promise<boolean>;
export declare function enableGroupfolderACL(connection: OcsConnection, groupfolderId: number, enable: boolean): Promise<boolean>;
export declare function setGroupfolderManageACL(connection: OcsConnection, groupfolderId: number, type: 'group' | 'user', id: string, manageACL: boolean): Promise<boolean>;
export declare function setGroupfolderQuota(connection: OcsConnection, groupfolderId: number, quota: number): Promise<boolean>;
export declare function renameGroupfolder(connection: OcsConnection, groupfolderId: number, mountpoint: string): Promise<boolean>;
export declare function setGroupfolderACL(connection: OcsConnection, groupfolderId: number, type: 'group' | 'user', id: string, path: string, permissions: string[]): Promise<boolean>;
