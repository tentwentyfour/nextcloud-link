"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var querystring = require("querystring");
var req = require("request");
var types_1 = require("./types");
var helper_1 = require("./helper");
var baseUrl = 'ocs/v2.php/apps/files_sharing/api/v1/shares';
function ocsGetShares(path, includeReshares, showForSubFiles, callback) {
    var self = this;
    var params = {
        format: 'json'
    };
    if (path) {
        params['path'] = path;
        params['reshares'] = includeReshares;
        params['subfiles'] = showForSubFiles;
    }
    var urlParams = querystring.stringify(params);
    req({
        url: self.options.url + "/" + baseUrl + "?" + urlParams,
        headers: self.getHeader()
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var result = null;
            if (!error && body && body.data) {
                result = [];
                body.data.forEach(function (share) {
                    result.push(parseOcsShare(share));
                });
            }
            callback(error, result);
        });
    });
}
exports.ocsGetShares = ocsGetShares;
function ocsGetShare(shareId, callback) {
    var self = this;
    req({
        url: self.options.url + "/" + baseUrl + "/" + shareId,
        headers: self.getHeader()
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var result = null;
            if (!error && body && body.data && body.data.length > 0) {
                result = parseOcsShare(body.data[0]);
            }
            callback(error, result);
        });
    });
}
exports.ocsGetShare = ocsGetShare;
function ocsDeleteShare(shareId, callback) {
    var self = this;
    req({
        url: self.options.url + "/" + baseUrl + "/" + shareId,
        method: 'DELETE',
        headers: self.getHeader()
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var shareDeleted = false;
            if (!error && body) {
                shareDeleted = true;
            }
            callback(error, shareDeleted);
        });
    });
}
exports.ocsDeleteShare = ocsDeleteShare;
function ocsAddShare(path, shareType, shareWith, permissions, password, publicUpload, callback) {
    var self = this;
    var share = {
        path: path,
        shareType: shareType,
    };
    share['publicUpload'] = String(publicUpload);
    if (shareWith) {
        share['shareWith'] = shareWith;
    }
    if (permissions && permissions !== types_1.OcsSharePermissions.default) {
        share['permissions'] = permissions;
    }
    if (password) {
        share['password'] = password;
    }
    req({
        url: self.options.url + "/" + baseUrl,
        method: 'POST',
        headers: self.getHeader(true),
        body: JSON.stringify(share)
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var result = null;
            if (!error && body && body.data) {
                result = parseOcsShare(body.data);
            }
            callback(error, result);
        });
    });
}
exports.ocsAddShare = ocsAddShare;
function ocsEditShare(shareId, field, value, callback) {
    var _a;
    var self = this;
    req({
        url: self.options.url + "/" + baseUrl + "/" + shareId,
        method: 'PUT',
        headers: self.getHeader(true),
        body: JSON.stringify((_a = {}, _a[field] = value, _a))
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var result = null;
            if (!error && body && body.data) {
                result = parseOcsShare(body.data);
            }
            callback(error, result);
        });
    });
}
exports.ocsEditShare = ocsEditShare;
function parseOcsShare(share) {
    var timestamp = parseInt(share.stime, 10);
    var permissionsInt = parseInt(share.permissions, 10);
    var shareTypeInt = parseInt(share.share_type, 10);
    var obj = {
        id: parseInt(share.id, 10),
        shareType: shareTypeInt,
        shareTypeSystemName: types_1.OcsShareType[shareTypeInt],
        ownerUserId: share.uid_owner,
        ownerDisplayName: share.displayname_owner,
        permissions: permissionsInt,
        permissionsText: helper_1.ocsSharePermissionsToText(permissionsInt),
        sharedOn: new Date(timestamp * 1000),
        sharedOnTimestamp: timestamp,
        parent: share.parent,
        expiration: share.expiration,
        token: share.token,
        fileOwnerUserId: share.uid_file_owner,
        fileOwnerDisplayName: share.displayname_file_owner,
        note: share.note,
        label: share.label,
        path: share.path,
        itemType: share.item_type,
        mimeType: share.mimetype,
        storageId: share.storage_id,
        storage: parseInt(share.storage, 10),
        fileId: parseInt(share.item_source, 10),
        parentFileId: parseInt(share.file_parent, 10),
        fileTarget: share.file_target,
        sharedWith: share.share_with,
        sharedWithDisplayName: share.share_with_displayname,
        mailSend: Boolean(share.mail_send),
        hideDownload: Boolean(share.hide_download),
    };
    helper_1.assignDefined(obj, {
        password: share.password,
        sendPasswordByTalk: share.send_password_by_talk,
        url: share.url,
    });
    return obj;
}
//# sourceMappingURL=share.js.map