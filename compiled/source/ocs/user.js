"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var querystring = require("querystring");
var req = require("request");
var baseUrl = 'ocs/v2.php/cloud/users';
function ocsGetUser(userId, callback) {
    var self = this;
    var urlParams = querystring.stringify({
        format: 'json'
    });
    req({
        url: self.options.url + "/" + baseUrl + "/" + userId + "?" + urlParams,
        headers: self.getHeader()
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var result = null;
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
    var self = this;
    var params = {
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
    var urlParams = querystring.stringify(params);
    req({
        url: self.options.url + "/" + baseUrl + "?" + urlParams,
        headers: self.getHeader()
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var users = null;
            if (!error && body && body.data && body.data.users) {
                users = [];
                body.data.users.forEach(function (user) {
                    users.push(user);
                });
            }
            callback(error, users);
        });
    });
}
exports.ocsListUsers = ocsListUsers;
function ocsSetUserEnabled(userId, isEnabled, callback) {
    var self = this;
    req({
        url: self.options.url + "/" + baseUrl + "/" + userId + "/" + (isEnabled ? 'enable' : 'disable'),
        method: 'PUT',
        headers: self.getHeader()
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var success = false;
            if (!error && body) {
                success = true;
            }
            callback(error, success);
        });
    });
}
exports.ocsSetUserEnabled = ocsSetUserEnabled;
function ocsDeleteUser(userId, callback) {
    var self = this;
    req({
        url: self.options.url + "/" + baseUrl + "/" + userId,
        method: 'DELETE',
        headers: self.getHeader()
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var userDeleted = false;
            if (!error && body) {
                userDeleted = true;
            }
            callback(error, userDeleted);
        });
    });
}
exports.ocsDeleteUser = ocsDeleteUser;
function ocsAddUser(user, callback) {
    var self = this;
    // Basic validation
    if (!user) {
        callback({ code: 0, message: 'must have a valid OcsNewUser object.' });
        return;
    }
    if (!user.userid) {
        callback({ code: 0, message: 'user must have an id.' });
        return;
    }
    req({
        url: self.options.url + "/" + baseUrl,
        method: 'POST',
        headers: self.getHeader(true),
        body: JSON.stringify(user)
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var userAdded = false;
            if (!error && body) {
                userAdded = true;
            }
            callback(error, userAdded);
        });
    });
}
exports.ocsAddUser = ocsAddUser;
function ocsEditUser(userId, field, value, callback) {
    var self = this;
    req({
        url: self.options.url + "/" + baseUrl + "/" + userId,
        method: 'PUT',
        headers: self.getHeader(true),
        body: JSON.stringify({ value: value, key: field })
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var userEdited = false;
            if (!error && body) {
                userEdited = true;
            }
            callback(error, userEdited);
        });
    });
}
exports.ocsEditUser = ocsEditUser;
function ocsGetUserGroups(userId, callback) {
    var self = this;
    // Basic validation
    if (!userId) {
        callback({ code: 0, message: 'no userId specified' });
        return;
    }
    req({
        url: self.options.url + "/" + baseUrl + "/" + userId + "/groups",
        headers: self.getHeader()
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var groups = null;
            if (!error && body && body.data && body.data.groups) {
                groups = [];
                body.data.groups.forEach(function (group) {
                    groups.push(group);
                });
            }
            callback(error, groups);
        });
    });
}
exports.ocsGetUserGroups = ocsGetUserGroups;
function ocsAddRemoveUserForGroup(userId, groupId, toAdd, callback) {
    var self = this;
    // Basic validation
    if (!userId) {
        callback({ code: 0, message: 'no userId specified' });
        return;
    }
    req({
        url: self.options.url + "/" + baseUrl + "/" + userId + "/groups",
        method: (toAdd ? 'POST' : 'DELETE'),
        headers: self.getHeader(true),
        body: JSON.stringify({ groupid: groupId })
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var userModifiedForGroup = false;
            if (!error && body) {
                userModifiedForGroup = true;
            }
            callback(error, userModifiedForGroup);
        });
    });
}
exports.ocsAddRemoveUserForGroup = ocsAddRemoveUserForGroup;
function ocsSetUserSubAdmin(userId, groupId, isSubAdmin, callback) {
    var self = this;
    // Basic validation
    if (!userId) {
        callback({ code: 0, message: 'no userId specified' });
        return;
    }
    req({
        url: self.options.url + "/" + baseUrl + "/" + userId + "/subadmins",
        method: (isSubAdmin ? 'POST' : 'DELETE'),
        headers: self.getHeader(true),
        body: JSON.stringify({ groupid: groupId })
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var subAdminModifiedForGroup = false;
            if (!error && body) {
                subAdminModifiedForGroup = true;
            }
            callback(error, subAdminModifiedForGroup);
        });
    });
}
exports.ocsSetUserSubAdmin = ocsSetUserSubAdmin;
function ocsGetUserSubAdmins(userId, callback) {
    var self = this;
    // Basic validation
    if (!userId) {
        callback({ code: 0, message: 'no userId specified' });
        return;
    }
    req({
        url: self.options.url + "/" + baseUrl + "/" + userId + "/subadmins",
        headers: self.getHeader()
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var subAdmins = null;
            if (!error && body && body.data) {
                subAdmins = [];
                body.data.forEach(function (subAdmin) {
                    subAdmins.push(subAdmin);
                });
            }
            callback(error, subAdmins);
        });
    });
}
exports.ocsGetUserSubAdmins = ocsGetUserSubAdmins;
function ocsResendUserWelcomeEmail(userId, callback) {
    var self = this;
    // Basic validation
    if (!userId) {
        callback({ code: 0, message: 'no userId specified' });
        return;
    }
    req({
        url: self.options.url + "/" + baseUrl + "/" + userId + "/welcome",
        method: 'POST',
        headers: self.getHeader()
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var success = false;
            if (!error && body) {
                success = true;
            }
            callback(error, success);
        });
    });
}
exports.ocsResendUserWelcomeEmail = ocsResendUserWelcomeEmail;
//# sourceMappingURL=user.js.map