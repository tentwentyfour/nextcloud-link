"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocsResendUserWelcomeEmail = exports.ocsGetUserSubAdmins = exports.ocsSetUserSubAdmin = exports.ocsAddRemoveUserForGroup = exports.ocsGetUserGroups = exports.ocsEditUser = exports.ocsAddUser = exports.ocsDeleteUser = exports.ocsSetUserEnabled = exports.ocsListUsers = exports.ocsGetUser = void 0;
const requestWrapper_1 = require("../requestWrapper");
const baseUrl = 'ocs/v2.php/cloud/users';
function ocsGetUser(userId, callback) {
    const self = this;
    const urlParams = new URLSearchParams({
        format: 'json'
    }).toString();
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${userId}?${urlParams}`,
        headers: self.getHeader()
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let result = null;
            if (!error && body && body.data) {
                result = {
                    id: body.data.id,
                    enabled: body.data.enabled,
                    lastLogin: body.data.lastLogin,
                    email: body.data.email,
                    displayname: body.data.displayname,
                    phone: body.data.phone,
                    address: body.data.address,
                    website: body.data.website,
                    twitter: body.data.twitter,
                    groups: body.data.groups,
                    language: body.data.language,
                    locale: body.data.locale
                };
            }
            callback(error, result);
        });
    });
}
exports.ocsGetUser = ocsGetUser;
function ocsListUsers(search, limit, offset, callback) {
    const self = this;
    const params = {
        format: 'json',
    };
    if (search) {
        params['search'] = search;
    }
    if (limit > -1) {
        params['limit'] = limit;
    }
    if (offset > -1) {
        params['offset'] = offset;
    }
    const urlParams = new URLSearchParams(params)
        .toString();
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}?${urlParams}`,
        headers: self.getHeader()
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let users = null;
            if (!error && body && body.data && body.data.users) {
                users = [];
                body.data.users.forEach(user => {
                    users.push(user);
                });
            }
            callback(error, users);
        });
    });
}
exports.ocsListUsers = ocsListUsers;
function ocsSetUserEnabled(userId, isEnabled, callback) {
    const self = this;
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${userId}/${isEnabled ? 'enable' : 'disable'}`,
        method: 'PUT',
        headers: self.getHeader()
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let success = false;
            if (!error && body) {
                success = true;
            }
            callback(error, success);
        });
    });
}
exports.ocsSetUserEnabled = ocsSetUserEnabled;
function ocsDeleteUser(userId, callback) {
    const self = this;
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${userId}`,
        method: 'DELETE',
        headers: self.getHeader()
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let userDeleted = false;
            if (!error && body) {
                userDeleted = true;
            }
            callback(error, userDeleted);
        });
    });
}
exports.ocsDeleteUser = ocsDeleteUser;
function ocsAddUser(user, callback) {
    const self = this;
    if (!user) {
        callback({ code: 0, message: 'must have a valid OcsNewUser object.' });
        return;
    }
    if (!user.userid) {
        callback({ code: 0, message: 'user must have an id.' });
        return;
    }
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}`,
        method: 'POST',
        headers: self.getHeader(true),
        data: JSON.stringify(user)
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let userAdded = false;
            if (!error && body) {
                userAdded = true;
            }
            callback(error, userAdded);
        });
    });
}
exports.ocsAddUser = ocsAddUser;
function ocsEditUser(userId, field, value, callback) {
    const self = this;
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${userId}`,
        method: 'PUT',
        headers: self.getHeader(true),
        data: JSON.stringify({ value, key: field })
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let userEdited = false;
            if (!error && body) {
                userEdited = true;
            }
            callback(error, userEdited);
        });
    });
}
exports.ocsEditUser = ocsEditUser;
function ocsGetUserGroups(userId, callback) {
    const self = this;
    if (!userId) {
        callback({ code: 0, message: 'no userId specified' });
        return;
    }
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${userId}/groups`,
        headers: self.getHeader()
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let groups = null;
            if (!error && body && body.data && body.data.groups) {
                groups = [];
                body.data.groups.forEach(group => {
                    groups.push(group);
                });
            }
            callback(error, groups);
        });
    });
}
exports.ocsGetUserGroups = ocsGetUserGroups;
function ocsAddRemoveUserForGroup(userId, groupId, toAdd, callback) {
    const self = this;
    if (!userId) {
        callback({ code: 0, message: 'no userId specified' });
        return;
    }
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${userId}/groups`,
        method: (toAdd ? 'POST' : 'DELETE'),
        headers: self.getHeader(true),
        data: JSON.stringify({ groupid: groupId })
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let userModifiedForGroup = false;
            if (!error && body) {
                userModifiedForGroup = true;
            }
            callback(error, userModifiedForGroup);
        });
    });
}
exports.ocsAddRemoveUserForGroup = ocsAddRemoveUserForGroup;
function ocsSetUserSubAdmin(userId, groupId, isSubAdmin, callback) {
    const self = this;
    if (!userId) {
        callback({ code: 0, message: 'no userId specified' });
        return;
    }
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${userId}/subadmins`,
        method: (isSubAdmin ? 'POST' : 'DELETE'),
        headers: self.getHeader(true),
        data: JSON.stringify({ groupid: groupId })
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let subAdminModifiedForGroup = false;
            if (!error && body) {
                subAdminModifiedForGroup = true;
            }
            callback(error, subAdminModifiedForGroup);
        });
    });
}
exports.ocsSetUserSubAdmin = ocsSetUserSubAdmin;
function ocsGetUserSubAdmins(userId, callback) {
    const self = this;
    if (!userId) {
        callback({ code: 0, message: 'no userId specified' });
        return;
    }
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${userId}/subadmins`,
        headers: self.getHeader()
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let subAdmins = null;
            if (!error && body && body.data) {
                subAdmins = [];
                body.data.forEach(subAdmin => {
                    subAdmins.push(subAdmin);
                });
            }
            callback(error, subAdmins);
        });
    });
}
exports.ocsGetUserSubAdmins = ocsGetUserSubAdmins;
function ocsResendUserWelcomeEmail(userId, callback) {
    const self = this;
    if (!userId) {
        callback({ code: 0, message: 'no userId specified' });
        return;
    }
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${userId}/welcome`,
        method: 'POST',
        headers: self.getHeader()
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let success = false;
            if (!error && body) {
                success = true;
            }
            callback(error, success);
        });
    });
}
exports.ocsResendUserWelcomeEmail = ocsResendUserWelcomeEmail;
