"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocsGetGroupSubAdmins = exports.ocsGetGroupUsers = exports.ocsDeleteGroup = exports.ocsAddGroup = exports.ocsListGroups = void 0;
const requestWrapper_1 = require("../requestWrapper");
const baseUrl = 'ocs/v2.php/cloud/groups';
function ocsListGroups(search, limit, offset, callback) {
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
            let result = null;
            if (!error && body && body.data && body.data.groups) {
                result = [];
                body.data.groups.forEach(group => {
                    result.push(group);
                });
            }
            callback(error, result);
        });
    });
}
exports.ocsListGroups = ocsListGroups;
function ocsAddGroup(groupId, callback) {
    const self = this;
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}`,
        method: 'POST',
        headers: self.getHeader(true),
        data: JSON.stringify({
            groupid: groupId
        })
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let groupAdded = false;
            if (!error && body) {
                groupAdded = true;
            }
            callback(error, groupAdded);
        });
    });
}
exports.ocsAddGroup = ocsAddGroup;
function ocsDeleteGroup(groupId, callback) {
    const self = this;
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${groupId}`,
        method: 'DELETE',
        headers: self.getHeader(true)
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let groupDeleted = false;
            if (!error && body) {
                groupDeleted = true;
            }
            callback(error, groupDeleted);
        });
    });
}
exports.ocsDeleteGroup = ocsDeleteGroup;
function ocsGetGroupUsers(groupId, callback) {
    const self = this;
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${groupId}`,
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
exports.ocsGetGroupUsers = ocsGetGroupUsers;
function ocsGetGroupSubAdmins(groupId, callback) {
    const self = this;
    (0, requestWrapper_1.req)({
        url: `${self.options.url}/${baseUrl}/${groupId}/subadmins`,
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
exports.ocsGetGroupSubAdmins = ocsGetGroupSubAdmins;
