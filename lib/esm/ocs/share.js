import { OcsSharePermissions, OcsShareType, } from './types';
import { assignDefined, ocsSharePermissionsToText } from './helper';
import { req } from '../requestWrapper';
const baseUrl = 'ocs/v2.php/apps/files_sharing/api/v1/shares';
export function ocsGetShares(path, includeReshares, showForSubFiles, callback) {
    const self = this;
    const params = {
        format: 'json'
    };
    if (path) {
        params['path'] = path;
        params['reshares'] = includeReshares;
        params['subfiles'] = showForSubFiles;
    }
    const urlParams = new URLSearchParams(params)
        .toString();
    req({
        url: `${self.options.url}/${baseUrl}?${urlParams}`,
        headers: self.getHeader()
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let result = null;
            if (!error && body && body.data) {
                result = [];
                body.data.forEach(share => {
                    result.push(parseOcsShare(share));
                });
            }
            callback(error, result);
        });
    });
}
export function ocsGetShare(shareId, callback) {
    const self = this;
    req({
        url: `${self.options.url}/${baseUrl}/${shareId}`,
        headers: self.getHeader()
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let result = null;
            if (!error && body && body.data && body.data.length > 0) {
                result = parseOcsShare(body.data[0]);
            }
            callback(error, result);
        });
    });
}
export function ocsDeleteShare(shareId, callback) {
    const self = this;
    req({
        url: `${self.options.url}/${baseUrl}/${shareId}`,
        method: 'DELETE',
        headers: self.getHeader()
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let shareDeleted = false;
            if (!error && body) {
                shareDeleted = true;
            }
            callback(error, shareDeleted);
        });
    });
}
export function ocsAddShare(path, shareType, shareWith, permissions, password, publicUpload, callback) {
    const self = this;
    const share = {
        path,
        shareType,
    };
    share['publicUpload'] = String(publicUpload);
    if (shareWith) {
        share['shareWith'] = shareWith;
    }
    if (permissions && permissions !== OcsSharePermissions.default) {
        share['permissions'] = permissions;
    }
    if (password) {
        share['password'] = password;
    }
    req({
        url: `${self.options.url}/${baseUrl}`,
        method: 'POST',
        headers: self.getHeader(true),
        data: JSON.stringify(share)
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let result = null;
            if (!error && body && body.data) {
                result = parseOcsShare(body.data);
            }
            callback(error, result);
        });
    });
}
export function ocsEditShare(shareId, field, value, callback) {
    const self = this;
    req({
        url: `${self.options.url}/${baseUrl}/${shareId}`,
        method: 'PUT',
        headers: self.getHeader(true),
        data: JSON.stringify({ [field]: value })
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let result = null;
            if (!error && body && body.data) {
                result = parseOcsShare(body.data);
            }
            callback(error, result);
        });
    });
}
function parseOcsShare(share) {
    const timestamp = parseInt(share.stime, 10);
    const permissionsInt = parseInt(share.permissions, 10);
    const shareTypeInt = parseInt(share.share_type, 10);
    const obj = {
        id: parseInt(share.id, 10),
        shareType: shareTypeInt,
        shareTypeSystemName: OcsShareType[shareTypeInt],
        ownerUserId: share.uid_owner,
        ownerDisplayName: share.displayname_owner,
        permissions: permissionsInt,
        permissionsText: ocsSharePermissionsToText(permissionsInt),
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
    assignDefined(obj, {
        password: share.password,
        sendPasswordByTalk: share.send_password_by_talk,
        url: share.url,
    });
    return obj;
}
