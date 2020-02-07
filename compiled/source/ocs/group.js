"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var querystring = require("querystring");
var req = require("request");
var baseUrl = 'ocs/v2.php/cloud/groups';
function ocsListGroups(search, limit, offset, callback) {
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
            var result = null;
            if (!error && body && body.data && body.data.groups) {
                result = [];
                body.data.groups.forEach(function (group) {
                    result.push(group);
                });
            }
            callback(error, result);
        });
    });
}
exports.ocsListGroups = ocsListGroups;
function ocsAddGroup(groupId, callback) {
    var self = this;
    req({
        url: self.options.url + "/" + baseUrl,
        method: 'POST',
        headers: self.getHeader(true),
        body: JSON.stringify({
            groupid: groupId
        })
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var groupAdded = false;
            if (!error && body) {
                groupAdded = true;
            }
            callback(error, groupAdded);
        });
    });
}
exports.ocsAddGroup = ocsAddGroup;
function ocsDeleteGroup(groupId, callback) {
    var self = this;
    req({
        url: self.options.url + "/" + baseUrl + "/" + groupId,
        method: 'DELETE',
        headers: self.getHeader(true)
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var groupDeleted = false;
            if (!error && body) {
                groupDeleted = true;
            }
            callback(error, groupDeleted);
        });
    });
}
exports.ocsDeleteGroup = ocsDeleteGroup;
function ocsGetGroupUsers(groupId, callback) {
    var self = this;
    req({
        url: self.options.url + "/" + baseUrl + "/" + groupId,
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
exports.ocsGetGroupUsers = ocsGetGroupUsers;
function ocsGetGroupSubAdmins(groupId, callback) {
    var self = this;
    req({
        url: self.options.url + "/" + baseUrl + "/" + groupId + "/subadmins",
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
exports.ocsGetGroupSubAdmins = ocsGetGroupSubAdmins;
//# sourceMappingURL=group.js.map