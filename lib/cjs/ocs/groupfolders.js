"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocsRenameGroupfolder = exports.ocsSetGroupfolderQuota = exports.ocsSetGroupfolderManageACL = exports.ocsEnableOrDisableGroupfolderACL = exports.ocsSetGroupfolderPermissions = exports.ocsRemoveGroupfolderGroup = exports.ocsAddGroupfolderGroup = exports.ocsRemoveGroupfolder = exports.ocsAddGroupfolder = exports.ocsGetGroupfolder = exports.ocsGetGroupfolders = void 0;
const requestWrapper_1 = require("../requestWrapper");
const baseUrl = 'apps/groupfolders/folders';
function ocsGetGroupfolders(callback) {
    const self = this;
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}`,
        headers: self.getHeader(true),
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let result = null;
            if (!error && body && body.data) {
                result = [];
                Object.values(body.data).forEach(groupfolder => {
                    result.push(parseOcsGroupfolder(groupfolder));
                });
            }
            callback(error, result);
        });
    });
}
exports.ocsGetGroupfolders = ocsGetGroupfolders;
function ocsGetGroupfolder(groupfolderId, callback) {
    const self = this;
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${groupfolderId}`,
        headers: self.getHeader(true),
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let result = null;
            if (!error && body && body.data) {
                result = parseOcsGroupfolder(body.data);
            }
            callback(error, result);
        });
    });
}
exports.ocsGetGroupfolder = ocsGetGroupfolder;
function ocsAddGroupfolder(mountpoint, callback) {
    const self = this;
    const body = {
        mountpoint,
    };
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}`,
        method: 'POST',
        headers: self.getHeader(true),
        data: JSON.stringify(body),
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let result = null;
            if (!error && body && body.data) {
                result = parseOcsGroupfolderId(body.data);
            }
            callback(error, result);
        });
    });
}
exports.ocsAddGroupfolder = ocsAddGroupfolder;
function ocsRemoveGroupfolder(groupfolderId, callback) {
    const self = this;
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${groupfolderId}`,
        method: 'DELETE',
        headers: self.getHeader(),
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let groupfolderDeleted = false;
            if (!error && body) {
                groupfolderDeleted = true;
            }
            callback(error, groupfolderDeleted);
        });
    });
}
exports.ocsRemoveGroupfolder = ocsRemoveGroupfolder;
function ocsAddGroupfolderGroup(groupfolderId, groupId, callback) {
    const self = this;
    const body = {
        group: groupId,
    };
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${groupfolderId}/groups`,
        method: 'POST',
        headers: self.getHeader(true),
        data: JSON.stringify(body)
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let groupfolderGroupAdded = false;
            if (!error && body) {
                groupfolderGroupAdded = true;
            }
            callback(error, groupfolderGroupAdded);
        });
    });
}
exports.ocsAddGroupfolderGroup = ocsAddGroupfolderGroup;
function ocsRemoveGroupfolderGroup(groupfolderId, groupId, callback) {
    const self = this;
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${groupfolderId}/groups/${groupId}`,
        method: 'DELETE',
        headers: self.getHeader(),
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let groupfolderGroupRemoved = false;
            if (!error && body) {
                groupfolderGroupRemoved = true;
            }
            callback(error, groupfolderGroupRemoved);
        });
    });
}
exports.ocsRemoveGroupfolderGroup = ocsRemoveGroupfolderGroup;
function ocsSetGroupfolderPermissions(groupfolderId, groupId, permissions, callback) {
    const self = this;
    const body = {
        permissions,
    };
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${groupfolderId}/groups/${groupId}`,
        method: 'POST',
        headers: self.getHeader(true),
        data: JSON.stringify(body),
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let groupfolderPermissionsSet = false;
            if (!error && body) {
                groupfolderPermissionsSet = true;
            }
            callback(error, groupfolderPermissionsSet);
        });
    });
}
exports.ocsSetGroupfolderPermissions = ocsSetGroupfolderPermissions;
function ocsEnableOrDisableGroupfolderACL(groupfolderId, enable, callback) {
    const self = this;
    const body = {
        acl: enable ? 1 : 0
    };
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${groupfolderId}/acl`,
        method: 'POST',
        headers: self.getHeader(true),
        data: JSON.stringify(body),
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let groupfolderACLset = false;
            if (!error && body) {
                groupfolderACLset = true;
            }
            callback(error, groupfolderACLset);
        });
    });
}
exports.ocsEnableOrDisableGroupfolderACL = ocsEnableOrDisableGroupfolderACL;
function ocsSetGroupfolderManageACL(groupfolderId, type, id, manageACL, callback) {
    const self = this;
    const body = {
        mappingType: type,
        mappingId: id,
        manageAcl: manageACL ? 1 : 0
    };
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${groupfolderId}/manageACL`,
        method: 'POST',
        headers: self.getHeader(true),
        data: JSON.stringify(body),
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let groupfolderPermissionsSet = false;
            if (!error && body) {
                groupfolderPermissionsSet = true;
            }
            callback(error, groupfolderPermissionsSet);
        });
    });
}
exports.ocsSetGroupfolderManageACL = ocsSetGroupfolderManageACL;
function ocsSetGroupfolderQuota(groupfolderId, quota, callback) {
    const self = this;
    const body = {
        quota: Number.isNaN(quota) ? -3 : quota,
    };
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${groupfolderId}/quota`,
        method: 'POST',
        headers: self.getHeader(true),
        data: JSON.stringify(body),
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let groupfolderQuotaSet = false;
            if (!error && body) {
                groupfolderQuotaSet = true;
            }
            callback(error, groupfolderQuotaSet);
        });
    });
}
exports.ocsSetGroupfolderQuota = ocsSetGroupfolderQuota;
function ocsRenameGroupfolder(groupfolderId, mountpoint, callback) {
    const self = this;
    const body = {
        mountpoint,
    };
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${groupfolderId}/mountpoint`,
        method: 'POST',
        headers: self.getHeader(true),
        data: JSON.stringify(body),
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let groupfolderRenamed = false;
            if (!error && body) {
                groupfolderRenamed = true;
            }
            callback(error, groupfolderRenamed);
        });
    });
}
exports.ocsRenameGroupfolder = ocsRenameGroupfolder;
function parseOcsGroupfolder(groupfolder) {
    return {
        id: parseInt(groupfolder.id, 10),
        mountPoint: groupfolder.mount_point,
        groups: groupfolder.groups,
        quota: groupfolder.quota,
        size: groupfolder.size,
        acl: groupfolder.acl,
        manage: groupfolder.manage,
    };
}
function parseOcsGroupfolderId(groupfolder) {
    return parseInt(groupfolder.id, 10);
}
