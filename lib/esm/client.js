import { WebDavClient } from './webdav';
import { getCreatorByFileId, getCreatorByPath, } from './common';
export * from './errors';
import { addRemoveUserSubAdminForGroup, setGroupfolderPermissions, setGroupfolderManageACL, configureOcsConnection, resendUserWelcomeEmail, removeGroupfolderGroup, addRemoveUserForGroup, enableGroupfolderACL, addGroupfolderGroup, setGroupfolderQuota, getGroupSubAdmins, renameGroupfolder, removeGroupfolder, getUserSubAdmins, getGroupfolders, addGroupfolder, getGroupfolder, setUserEnabled, getActivities, getGroupUsers, getUserGroups, deleteGroup, deleteShare, deleteUser, listGroups, editShare, getShares, listUsers, addGroup, addShare, editUser, getShare, getUser, addUser, } from './ocs/ocs';
import { NextcloudClientProperties } from './types';
import { NextCloudClientException } from './errors';
import { Optional } from 'lonad';
export { createOwnCloudFileDetailProperty, createNextCloudFileDetailProperty, } from './helper';
export { createDetailProperty } from './webdav.utils';
export class NextcloudClient extends NextcloudClientProperties {
    constructor(options) {
        super();
        this.options = options;
        this.configureOcsConnection = configureOcsConnection;
        this.createFolderHierarchy = this.wrapWebDav(WebDavClient.prototype.createFolderHierarchy);
        this.getFolderFileDetails = this.wrapWebDav(WebDavClient.prototype.getFolderFileDetails);
        this.getFolderProperties = this.wrapWebDav(WebDavClient.prototype.getFolderProperties);
        this.checkConnectivity = this.wrapWebDav(WebDavClient.prototype.checkConnectivity);
        this.downloadToStream = this.wrapWebDav(WebDavClient.prototype.downloadToStream);
        this.uploadFromStream = this.wrapWebDav(WebDavClient.prototype.uploadFromStream);
        this.getFilesDetailed = this.wrapWebDav(WebDavClient.prototype.getFilesDetailed);
        this.getWriteStream = this.wrapWebDav(WebDavClient.prototype.getWriteStream);
        this.getReadStream = this.wrapWebDav(WebDavClient.prototype.getReadStream);
        this.touchFolder = this.wrapWebDav(WebDavClient.prototype.touchFolder);
        this.getPathInfo = this.wrapWebDav(WebDavClient.prototype.getPathInfo);
        this.getFiles = this.wrapWebDav(WebDavClient.prototype.getFiles);
        this.rename = this.wrapWebDav(WebDavClient.prototype.rename);
        this.remove = this.wrapWebDav(WebDavClient.prototype.remove);
        this.exists = this.wrapWebDav(WebDavClient.prototype.exists);
        this.move = this.wrapWebDav(WebDavClient.prototype.move);
        this.put = this.wrapWebDav(WebDavClient.prototype.put);
        this.get = this.wrapWebDav(WebDavClient.prototype.get);
        this.getCreatorByFileId = getCreatorByFileId;
        this.getCreatorByPath = getCreatorByPath;
        this.activities = {
            get: (fileId, sort, limit, sinceActivityId) => getActivities(this.ocsConnection, fileId, sort, limit, sinceActivityId)
        };
        this.users = {
            removeSubAdminFromGroup: (userId, groupId) => addRemoveUserSubAdminForGroup(this.ocsConnection, userId, groupId, false),
            addSubAdminToGroup: (userId, groupId) => addRemoveUserSubAdminForGroup(this.ocsConnection, userId, groupId, true),
            resendWelcomeEmail: (userId) => resendUserWelcomeEmail(this.ocsConnection, userId),
            getSubAdminGroups: (userId) => getUserSubAdmins(this.ocsConnection, userId),
            removeFromGroup: (userId, groupId) => addRemoveUserForGroup(this.ocsConnection, userId, groupId, false),
            setEnabled: (userId, isEnabled) => setUserEnabled(this.ocsConnection, userId, isEnabled),
            addToGroup: (userId, groupId) => addRemoveUserForGroup(this.ocsConnection, userId, groupId, true),
            getGroups: (userId) => getUserGroups(this.ocsConnection, userId),
            delete: (userId) => deleteUser(this.ocsConnection, userId),
            edit: (userId, field, value) => editUser(this.ocsConnection, userId, field, value),
            list: (search, limit, offset) => listUsers(this.ocsConnection, search, limit, offset),
            add: (user) => addUser(this.ocsConnection, user),
            get: (userId) => getUser(this.ocsConnection, userId),
        };
        this.groups = {
            getSubAdmins: (groupId) => getGroupSubAdmins(this.ocsConnection, groupId),
            getUsers: (groupId) => getGroupUsers(this.ocsConnection, groupId),
            delete: (groupId) => deleteGroup(this.ocsConnection, groupId),
            list: (search, limit, offset) => listGroups(this.ocsConnection, search, limit, offset),
            add: (groupId) => addGroup(this.ocsConnection, groupId),
        };
        this.shares = {
            delete: (shareId) => deleteShare(this.ocsConnection, shareId),
            edit: {
                permissions: (shareId, permissions) => editShare(this.ocsConnection, shareId).permissions(permissions),
                password: (shareId, password) => editShare(this.ocsConnection, shareId).password(password),
                publicUpload: (shareId, isPublicUpload) => editShare(this.ocsConnection, shareId).publicUpload(isPublicUpload),
                expireDate: (shareId, expireDate) => editShare(this.ocsConnection, shareId).expireDate(expireDate),
                note: (shareId, note) => editShare(this.ocsConnection, shareId).note(note),
            },
            list: (path, includeReshares, showForSubFiles) => getShares(this.ocsConnection, path, includeReshares, showForSubFiles),
            add: (path, shareType, shareWith, permissions, password, publicUpload) => addShare(this.ocsConnection, path, shareType, shareWith, permissions, password, publicUpload),
            get: (shareId) => getShare(this.ocsConnection, shareId),
        };
        this.groupfolders = {
            getFolders: () => getGroupfolders(this.ocsConnection),
            getFolder: (fid) => getGroupfolder(this.ocsConnection, fid),
            addFolder: (mountpoint) => addGroupfolder(this.ocsConnection, mountpoint),
            removeFolder: (fid) => removeGroupfolder(this.ocsConnection, fid),
            addGroup: (fid, gid) => addGroupfolderGroup(this.ocsConnection, fid, gid),
            removeGroup: (fid, gid) => removeGroupfolderGroup(this.ocsConnection, fid, gid),
            setPermissions: (fid, gid, permissions) => setGroupfolderPermissions(this.ocsConnection, fid, gid, permissions),
            enableACL: (fid, enable) => enableGroupfolderACL(this.ocsConnection, fid, enable),
            setManageACL: (fid, type, id, manageACL) => setGroupfolderManageACL(this.ocsConnection, fid, type, id, manageACL),
            setQuota: (fid, quota) => setGroupfolderQuota(this.ocsConnection, fid, quota),
            renameFolder: (fid, mountpoint) => renameGroupfolder(this.ocsConnection, fid, mountpoint),
        };
        this.username = options.username;
        this.url = options.url.endsWith('/') ? options.url.slice(0, -1) : options.url;
        this.webdavConnection = Optional.None();
        this.configureOcsConnection(options);
    }
    as(username, password) {
        return new NextcloudClient({ username, password, url: this.url });
    }
    wrapWebDav(fn) {
        return (async (...args) => {
            if (Optional.isNone(this.webdavConnection)) {
                this.webdavConnection = Optional.fromNullable(await WebDavClient.create(this.url, this.options));
            }
            if (Optional.isNone(this.webdavConnection)) {
                throw new NextCloudClientException('WebDAV connection could not be initialized');
            }
            return fn.apply(this.webdavConnection.get(), args);
        });
    }
}
export default NextcloudClient;
