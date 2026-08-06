"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextcloudClient = exports.createDetailProperty = exports.createNextCloudFileDetailProperty = exports.createOwnCloudFileDetailProperty = void 0;
const webdav_1 = require("./webdav");
const common_1 = require("./common");
__exportStar(require("./errors"), exports);
const ocs_1 = require("./ocs/ocs");
const types_1 = require("./types");
const errors_1 = require("./errors");
const lonad_1 = require("lonad");
var helper_1 = require("./helper");
Object.defineProperty(exports, "createOwnCloudFileDetailProperty", { enumerable: true, get: function () { return helper_1.createOwnCloudFileDetailProperty; } });
Object.defineProperty(exports, "createNextCloudFileDetailProperty", { enumerable: true, get: function () { return helper_1.createNextCloudFileDetailProperty; } });
var webdav_utils_1 = require("./webdav.utils");
Object.defineProperty(exports, "createDetailProperty", { enumerable: true, get: function () { return webdav_utils_1.createDetailProperty; } });
class NextcloudClient extends types_1.NextcloudClientProperties {
    constructor(options) {
        super();
        this.options = options;
        this.configureOcsConnection = ocs_1.configureOcsConnection;
        this.createFolderHierarchy = this.wrapWebDav(webdav_1.WebDavClient.prototype.createFolderHierarchy);
        this.getFolderFileDetails = this.wrapWebDav(webdav_1.WebDavClient.prototype.getFolderFileDetails);
        this.getFolderProperties = this.wrapWebDav(webdav_1.WebDavClient.prototype.getFolderProperties);
        this.checkConnectivity = this.wrapWebDav(webdav_1.WebDavClient.prototype.checkConnectivity);
        this.downloadToStream = this.wrapWebDav(webdav_1.WebDavClient.prototype.downloadToStream);
        this.uploadFromStream = this.wrapWebDav(webdav_1.WebDavClient.prototype.uploadFromStream);
        this.getFilesDetailed = this.wrapWebDav(webdav_1.WebDavClient.prototype.getFilesDetailed);
        this.getWriteStream = this.wrapWebDav(webdav_1.WebDavClient.prototype.getWriteStream);
        this.getReadStream = this.wrapWebDav(webdav_1.WebDavClient.prototype.getReadStream);
        this.touchFolder = this.wrapWebDav(webdav_1.WebDavClient.prototype.touchFolder);
        this.getPathInfo = this.wrapWebDav(webdav_1.WebDavClient.prototype.getPathInfo);
        this.getFiles = this.wrapWebDav(webdav_1.WebDavClient.prototype.getFiles);
        this.rename = this.wrapWebDav(webdav_1.WebDavClient.prototype.rename);
        this.remove = this.wrapWebDav(webdav_1.WebDavClient.prototype.remove);
        this.exists = this.wrapWebDav(webdav_1.WebDavClient.prototype.exists);
        this.move = this.wrapWebDav(webdav_1.WebDavClient.prototype.move);
        this.put = this.wrapWebDav(webdav_1.WebDavClient.prototype.put);
        this.get = this.wrapWebDav(webdav_1.WebDavClient.prototype.get);
        this.getCreatorByFileId = common_1.getCreatorByFileId;
        this.getCreatorByPath = common_1.getCreatorByPath;
        this.activities = {
            get: (fileId, sort, limit, sinceActivityId) => (0, ocs_1.getActivities)(this.ocsConnection, fileId, sort, limit, sinceActivityId)
        };
        this.users = {
            removeSubAdminFromGroup: (userId, groupId) => (0, ocs_1.addRemoveUserSubAdminForGroup)(this.ocsConnection, userId, groupId, false),
            addSubAdminToGroup: (userId, groupId) => (0, ocs_1.addRemoveUserSubAdminForGroup)(this.ocsConnection, userId, groupId, true),
            resendWelcomeEmail: (userId) => (0, ocs_1.resendUserWelcomeEmail)(this.ocsConnection, userId),
            getSubAdminGroups: (userId) => (0, ocs_1.getUserSubAdmins)(this.ocsConnection, userId),
            removeFromGroup: (userId, groupId) => (0, ocs_1.addRemoveUserForGroup)(this.ocsConnection, userId, groupId, false),
            setEnabled: (userId, isEnabled) => (0, ocs_1.setUserEnabled)(this.ocsConnection, userId, isEnabled),
            addToGroup: (userId, groupId) => (0, ocs_1.addRemoveUserForGroup)(this.ocsConnection, userId, groupId, true),
            getGroups: (userId) => (0, ocs_1.getUserGroups)(this.ocsConnection, userId),
            delete: (userId) => (0, ocs_1.deleteUser)(this.ocsConnection, userId),
            edit: (userId, field, value) => (0, ocs_1.editUser)(this.ocsConnection, userId, field, value),
            list: (search, limit, offset) => (0, ocs_1.listUsers)(this.ocsConnection, search, limit, offset),
            add: (user) => (0, ocs_1.addUser)(this.ocsConnection, user),
            get: (userId) => (0, ocs_1.getUser)(this.ocsConnection, userId),
        };
        this.groups = {
            getSubAdmins: (groupId) => (0, ocs_1.getGroupSubAdmins)(this.ocsConnection, groupId),
            getUsers: (groupId) => (0, ocs_1.getGroupUsers)(this.ocsConnection, groupId),
            delete: (groupId) => (0, ocs_1.deleteGroup)(this.ocsConnection, groupId),
            list: (search, limit, offset) => (0, ocs_1.listGroups)(this.ocsConnection, search, limit, offset),
            add: (groupId) => (0, ocs_1.addGroup)(this.ocsConnection, groupId),
        };
        this.shares = {
            delete: (shareId) => (0, ocs_1.deleteShare)(this.ocsConnection, shareId),
            edit: {
                permissions: (shareId, permissions) => (0, ocs_1.editShare)(this.ocsConnection, shareId).permissions(permissions),
                password: (shareId, password) => (0, ocs_1.editShare)(this.ocsConnection, shareId).password(password),
                publicUpload: (shareId, isPublicUpload) => (0, ocs_1.editShare)(this.ocsConnection, shareId).publicUpload(isPublicUpload),
                expireDate: (shareId, expireDate) => (0, ocs_1.editShare)(this.ocsConnection, shareId).expireDate(expireDate),
                note: (shareId, note) => (0, ocs_1.editShare)(this.ocsConnection, shareId).note(note),
            },
            list: (path, includeReshares, showForSubFiles) => (0, ocs_1.getShares)(this.ocsConnection, path, includeReshares, showForSubFiles),
            add: (path, shareType, shareWith, permissions, password, publicUpload) => (0, ocs_1.addShare)(this.ocsConnection, path, shareType, shareWith, permissions, password, publicUpload),
            get: (shareId) => (0, ocs_1.getShare)(this.ocsConnection, shareId),
        };
        this.groupfolders = {
            getFolders: () => (0, ocs_1.getGroupfolders)(this.ocsConnection),
            getFolder: (fid) => (0, ocs_1.getGroupfolder)(this.ocsConnection, fid),
            addFolder: (mountpoint) => (0, ocs_1.addGroupfolder)(this.ocsConnection, mountpoint),
            removeFolder: (fid) => (0, ocs_1.removeGroupfolder)(this.ocsConnection, fid),
            addGroup: (fid, gid) => (0, ocs_1.addGroupfolderGroup)(this.ocsConnection, fid, gid),
            removeGroup: (fid, gid) => (0, ocs_1.removeGroupfolderGroup)(this.ocsConnection, fid, gid),
            setPermissions: (fid, gid, permissions) => (0, ocs_1.setGroupfolderPermissions)(this.ocsConnection, fid, gid, permissions),
            enableACL: (fid, enable) => (0, ocs_1.enableGroupfolderACL)(this.ocsConnection, fid, enable),
            setManageACL: (fid, type, id, manageACL) => (0, ocs_1.setGroupfolderManageACL)(this.ocsConnection, fid, type, id, manageACL),
            setQuota: (fid, quota) => (0, ocs_1.setGroupfolderQuota)(this.ocsConnection, fid, quota),
            renameFolder: (fid, mountpoint) => (0, ocs_1.renameGroupfolder)(this.ocsConnection, fid, mountpoint),
        };
        this.username = options.username;
        this.url = options.url.endsWith('/') ? options.url.slice(0, -1) : options.url;
        this.webdavConnection = lonad_1.Optional.None();
        this.configureOcsConnection(options);
    }
    as(username, password) {
        return new NextcloudClient({ username, password, url: this.url });
    }
    wrapWebDav(fn) {
        return (async (...args) => {
            if (lonad_1.Optional.isNone(this.webdavConnection)) {
                this.webdavConnection = lonad_1.Optional.fromNullable(await webdav_1.WebDavClient.create(this.url, this.options));
            }
            if (lonad_1.Optional.isNone(this.webdavConnection)) {
                throw new errors_1.NextCloudClientException('WebDAV connection could not be initialized');
            }
            return fn.apply(this.webdavConnection.get(), args);
        });
    }
}
exports.NextcloudClient = NextcloudClient;
exports.default = NextcloudClient;
