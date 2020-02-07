"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var helper_1 = require("./helper");
var activity_1 = require("./activity");
var ocs_connection_1 = require("./ocs-connection");
var util_1 = require("util");
var types_1 = require("./types");
var user_1 = require("./user");
var group_1 = require("./group");
var share_1 = require("./share");
var promisifiedGetActivities = util_1.promisify(activity_1.ocsGetActivities);
var promisifiedResendUserWelcomeEmail = util_1.promisify(user_1.ocsResendUserWelcomeEmail);
var promisifiedAddRemoveUserForGroup = util_1.promisify(user_1.ocsAddRemoveUserForGroup);
var promisifiedGetUserSubAdmins = util_1.promisify(user_1.ocsGetUserSubAdmins);
var promisifiedSetUserSubAdmin = util_1.promisify(user_1.ocsSetUserSubAdmin);
var promisifiedSetUserEnabled = util_1.promisify(user_1.ocsSetUserEnabled);
var promisifiedGetUserGroups = util_1.promisify(user_1.ocsGetUserGroups);
var promisifiedDeleteUser = util_1.promisify(user_1.ocsDeleteUser);
var promisifiedListUsers = util_1.promisify(user_1.ocsListUsers);
var promisifiedEditUser = util_1.promisify(user_1.ocsEditUser);
var promisifiedAddUser = util_1.promisify(user_1.ocsAddUser);
var promisifiedGetUser = util_1.promisify(user_1.ocsGetUser);
var promisifiedGetGroupSubAdmins = util_1.promisify(group_1.ocsGetGroupSubAdmins);
var promisifiedGetGroupUsers = util_1.promisify(group_1.ocsGetGroupUsers);
var promisifiedDeleteGroup = util_1.promisify(group_1.ocsDeleteGroup);
var promisifiedListGroups = util_1.promisify(group_1.ocsListGroups);
var promisifiedAddGroup = util_1.promisify(group_1.ocsAddGroup);
var promisifiedDeleteShare = util_1.promisify(share_1.ocsDeleteShare);
var promisifiedEditShare = util_1.promisify(share_1.ocsEditShare);
var promisifiedGetShares = util_1.promisify(share_1.ocsGetShares);
var promisifiedGetShare = util_1.promisify(share_1.ocsGetShare);
var promisifiedAddShare = util_1.promisify(share_1.ocsAddShare);
function configureOcsConnection(options) {
    var self = this;
    self.ocsConnection = new ocs_connection_1.OcsConnection({
        url: options.url,
        username: options.username,
        password: options.password
    });
}
exports.configureOcsConnection = configureOcsConnection;
function getActivities(connection, fileId, sort, limit, sinceActivityId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, activities, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedGetActivities.call(connection, (typeof fileId === 'string' ? parseInt(fileId, 10) : fileId), sort || 'desc', limit || -1, sinceActivityId || -1)];
                case 1:
                    activities = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    activities = helper_1.rejectWithOcsError(error_1, {
                        message: 'Unable to get activities for',
                        identifier: fileId,
                        useMeta: false,
                        customErrors: (_a = {},
                            _a[204] = 'The user has selected no activities to be listed in the stream',
                            _a[304] = 'ETag/If-None-Match are the same or the end of the activity list was reached',
                            _a[403] = 'The offset activity belongs to a different user or the user is not logged in',
                            _a[404] = 'The filter is unknown',
                            _a)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, activities];
            }
        });
    });
}
exports.getActivities = getActivities;
function getUser(connection, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var user, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedGetUser.call(connection, userId)];
                case 1:
                    user = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    user = helper_1.rejectWithOcsError(error_2, {
                        message: 'Unable to find user',
                        identifier: userId,
                        useMeta: false
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, user];
            }
        });
    });
}
exports.getUser = getUser;
function setUserEnabled(connection, userId, isEnabled) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, success, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedSetUserEnabled.call(connection, userId, isEnabled)];
                case 1:
                    success = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _b.sent();
                    success = helper_1.rejectWithOcsError(error_3, {
                        message: "Unable to " + (isEnabled ? 'enable' : 'disable') + " user",
                        identifier: userId,
                        useMeta: true,
                        customErrors: (_a = {},
                            _a[101] = 'user does not exist',
                            _a)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, success];
            }
        });
    });
}
exports.setUserEnabled = setUserEnabled;
function editUser(connection, userId, field, value) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, userEdited, error_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedEditUser.call(connection, userId, field, value)];
                case 1:
                    userEdited = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _b.sent();
                    userEdited = helper_1.rejectWithOcsError(error_4, {
                        message: 'Unable to edit user',
                        identifier: userId,
                        useMeta: true,
                        expectedErrorCodes: [400, 401],
                        customErrors: (_a = {},
                            _a[101] = 'user not found',
                            _a[997] = 'possible reasons: Does it exist? Do you have the right permissions? Is the field valid?',
                            _a)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, userEdited];
            }
        });
    });
}
exports.editUser = editUser;
function getUserGroups(connection, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var groups, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedGetUserGroups.call(connection, userId)];
                case 1:
                    groups = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    groups = helper_1.rejectWithOcsError(error_5, {
                        message: 'Unable to get groups for user',
                        identifier: userId,
                        useMeta: false
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, groups];
            }
        });
    });
}
exports.getUserGroups = getUserGroups;
function getUserSubAdmins(connection, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, subAdmins, error_6;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedGetUserSubAdmins.call(connection, userId)];
                case 1:
                    subAdmins = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _b.sent();
                    subAdmins = helper_1.rejectWithOcsError(error_6, {
                        message: 'Unable to get sub-admins for user',
                        identifier: userId,
                        useMeta: true,
                        expectedErrorCodes: [400],
                        customErrors: (_a = {},
                            _a[101] = 'user does not exist',
                            _a)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, subAdmins];
            }
        });
    });
}
exports.getUserSubAdmins = getUserSubAdmins;
function resendUserWelcomeEmail(connection, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, success, error_7;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedResendUserWelcomeEmail.call(connection, userId)];
                case 1:
                    success = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_7 = _b.sent();
                    success = helper_1.rejectWithOcsError(error_7, {
                        message: 'Unable to resend welcome email for user',
                        identifier: userId,
                        useMeta: true,
                        expectedErrorCodes: [400],
                        customErrors: (_a = {},
                            _a[101] = 'email address not available',
                            _a[102] = 'sending email failed',
                            _a)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, success];
            }
        });
    });
}
exports.resendUserWelcomeEmail = resendUserWelcomeEmail;
function addRemoveUserForGroup(connection, userId, groupId, toAdd) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, userModifiedForGroup, error_8;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedAddRemoveUserForGroup.call(connection, userId, groupId, toAdd)];
                case 1:
                    userModifiedForGroup = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_8 = _b.sent();
                    userModifiedForGroup = helper_1.rejectWithOcsError(error_8, {
                        message: "Unable to " + (toAdd ? 'add' : 'remove') + " user '" + userId + "' " + (toAdd ? 'to' : 'from') + " group",
                        identifier: groupId,
                        useMeta: true,
                        expectedErrorCodes: [400],
                        customErrors: (_a = {},
                            _a[101] = 'no group specified',
                            _a[102] = 'group does not exist',
                            _a[103] = 'user does not exist',
                            _a[104] = 'insufficient privileges',
                            _a)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, userModifiedForGroup];
            }
        });
    });
}
exports.addRemoveUserForGroup = addRemoveUserForGroup;
function addRemoveUserSubAdminForGroup(connection, userId, groupId, toAdd) {
    return __awaiter(this, void 0, void 0, function () {
        var subAdminModifiedForGroup, error_9, customErrors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedSetUserSubAdmin.call(connection, userId, groupId, toAdd)];
                case 1:
                    subAdminModifiedForGroup = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_9 = _a.sent();
                    customErrors = {};
                    if (toAdd) {
                        customErrors[101] = 'user does not exist';
                        customErrors[102] = 'group does not exist';
                    }
                    else {
                        customErrors[101] = 'user or group does not exist';
                        customErrors[102] = 'user is not a sub-admin of the group';
                    }
                    subAdminModifiedForGroup = helper_1.rejectWithOcsError(error_9, {
                        customErrors: customErrors,
                        message: "Unable to " + (toAdd ? 'add' : 'remove') + " user '" + userId + "' as sub-admin " + (toAdd ? 'to' : 'from') + " group",
                        identifier: groupId,
                        useMeta: true,
                        expectedErrorCodes: [400],
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, subAdminModifiedForGroup];
            }
        });
    });
}
exports.addRemoveUserSubAdminForGroup = addRemoveUserSubAdminForGroup;
function listUsers(connection, search, limit, offset) {
    return __awaiter(this, void 0, void 0, function () {
        var users, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedListUsers.call(connection, search || '', Number.isInteger(limit) ? limit : -1, Number.isInteger(offset) ? offset : -1)];
                case 1:
                    users = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_10 = _a.sent();
                    users = helper_1.rejectWithOcsError(error_10, {
                        message: 'Unable to list users',
                        useMeta: false
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, users];
            }
        });
    });
}
exports.listUsers = listUsers;
function deleteUser(connection, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, userDeleted, error_11;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedDeleteUser.call(connection, userId)];
                case 1:
                    userDeleted = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_11 = _b.sent();
                    userDeleted = helper_1.rejectWithOcsError(error_11, {
                        message: 'Unable to delete user',
                        identifier: userId,
                        useMeta: true,
                        expectedErrorCodes: [400],
                        customErrors: (_a = {},
                            _a[101] = 'user does not exist',
                            _a)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, userDeleted];
            }
        });
    });
}
exports.deleteUser = deleteUser;
function addUser(connection, user) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, userAdded, error_12;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedAddUser.call(connection, user)];
                case 1:
                    userAdded = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_12 = _b.sent();
                    userAdded = helper_1.rejectWithOcsError(error_12, {
                        message: 'Unable to add user',
                        identifier: (user && user.userid ? user.userid : ''),
                        useMeta: true,
                        expectedErrorCodes: [400],
                        customErrors: (_a = {},
                            _a[102] = 'username already exists',
                            _a[103] = 'unknown error occurred whilst adding the user',
                            _a[104] = 'group does not exist',
                            _a[105] = 'insufficient privileges for group',
                            _a[106] = 'no group specified (required for sub-admins',
                            _a[108] = 'password and email empty. Must set password or an email',
                            _a[109] = 'invitation email cannot be send',
                            _a)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, userAdded];
            }
        });
    });
}
exports.addUser = addUser;
function listGroups(connection, search, limit, offset) {
    return __awaiter(this, void 0, void 0, function () {
        var groups, error_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedListGroups.call(connection, search || '', Number.isInteger(limit) ? limit : -1, Number.isInteger(offset) ? offset : -1)];
                case 1:
                    groups = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_13 = _a.sent();
                    groups = helper_1.rejectWithOcsError(error_13, {
                        message: 'Unable to list groups',
                        useMeta: false
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, groups];
            }
        });
    });
}
exports.listGroups = listGroups;
function addGroup(connection, groupId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, groupAdded, error_14;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedAddGroup.call(connection, groupId)];
                case 1:
                    groupAdded = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_14 = _b.sent();
                    groupAdded = helper_1.rejectWithOcsError(error_14, {
                        message: 'Unable to add group',
                        identifier: groupId,
                        useMeta: true,
                        expectedErrorCodes: [400],
                        customErrors: (_a = {},
                            _a[102] = 'group already exists',
                            _a[103] = 'failed to add the group',
                            _a)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, groupAdded];
            }
        });
    });
}
exports.addGroup = addGroup;
function deleteGroup(connection, groupId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, groupDeleted, error_15;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedDeleteGroup.call(connection, groupId)];
                case 1:
                    groupDeleted = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_15 = _b.sent();
                    groupDeleted = helper_1.rejectWithOcsError(error_15, {
                        message: 'Unable to delete group',
                        identifier: groupId,
                        useMeta: true,
                        expectedErrorCodes: [400],
                        customErrors: (_a = {},
                            _a[101] = 'group does not exist',
                            _a[102] = 'failed to delete group',
                            _a)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, groupDeleted];
            }
        });
    });
}
exports.deleteGroup = deleteGroup;
function getGroupUsers(connection, groupId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, users, error_16;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedGetGroupUsers.call(connection, groupId)];
                case 1:
                    users = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_16 = _b.sent();
                    users = helper_1.rejectWithOcsError(error_16, {
                        message: 'Unable to list users for group',
                        identifier: groupId,
                        useMeta: false,
                        expectedErrorCodes: [404],
                        customErrors: (_a = {},
                            _a[404] = 'the group could not be found',
                            _a)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, users];
            }
        });
    });
}
exports.getGroupUsers = getGroupUsers;
function getGroupSubAdmins(connection, groupId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, subAdmins, error_17;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedGetGroupSubAdmins.call(connection, groupId)];
                case 1:
                    subAdmins = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_17 = _b.sent();
                    subAdmins = helper_1.rejectWithOcsError(error_17, {
                        message: 'Unable to list sub-admins for group',
                        identifier: groupId,
                        useMeta: true,
                        expectedErrorCodes: [400],
                        customErrors: (_a = {},
                            _a[101] = 'group does not exist',
                            _a)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, subAdmins];
            }
        });
    });
}
exports.getGroupSubAdmins = getGroupSubAdmins;
function getShares(connection, path, includeReshares, showForSubFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, shares, error_18;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedGetShares.call(connection, path || '', (includeReshares !== undefined ? includeReshares : false), (showForSubFiles !== undefined ? showForSubFiles : false))];
                case 1:
                    shares = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_18 = _b.sent();
                    shares = helper_1.rejectWithOcsError(error_18, {
                        message: 'Unable to get shares for',
                        identifier: path,
                        useMeta: true,
                        expectedErrorCodes: [400, 404],
                        customErrors: (_a = {},
                            _a[400] = 'unable to show sub-files as this is not a directory',
                            _a[404] = 'file/folder doesn\'t exist',
                            _a)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, shares];
            }
        });
    });
}
exports.getShares = getShares;
function getShare(connection, shareId) {
    return __awaiter(this, void 0, void 0, function () {
        var share, error_19;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedGetShare.call(connection, shareId)];
                case 1:
                    share = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_19 = _a.sent();
                    share = helper_1.rejectWithOcsError(error_19, {
                        message: 'Unable to get share',
                        identifier: shareId,
                        useMeta: true,
                        expectedErrorCodes: [404]
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, share];
            }
        });
    });
}
exports.getShare = getShare;
function deleteShare(connection, shareId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, shareDeleted, error_20;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedDeleteShare.call(connection, shareId)];
                case 1:
                    shareDeleted = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_20 = _b.sent();
                    shareDeleted = helper_1.rejectWithOcsError(error_20, {
                        message: 'Unable to delete share',
                        identifier: shareId,
                        useMeta: true,
                        expectedErrorCodes: [404],
                        customErrors: (_a = {},
                            _a[404] = 'invalid shareId or the share doesn\'t exist',
                            _a)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, shareDeleted];
            }
        });
    });
}
exports.deleteShare = deleteShare;
function addShare(connection, path, shareType, shareWith, permissions, password, publicUpload) {
    return __awaiter(this, void 0, void 0, function () {
        var addedShare, error_21;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisifiedAddShare.call(connection, path, shareType, shareWith || '', (permissions !== undefined ? permissions : types_1.OcsSharePermissions.default), password || '', (publicUpload !== undefined ? publicUpload : false))];
                case 1:
                    addedShare = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_21 = _a.sent();
                    addedShare = helper_1.rejectWithOcsError(error_21, {
                        message: 'Unable to add share',
                        identifier: path,
                        useMeta: true,
                        expectedErrorCodes: [403, 404]
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, addedShare];
            }
        });
    });
}
exports.addShare = addShare;
function editShare(connection, shareId) {
    return {
        permissions: function (permissions) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, setFieldValue(connection, shareId, 'permissions', permissions)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        },
        password: function (password) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, setFieldValue(connection, shareId, 'password', password)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        },
        publicUpload: function (isPublicUpload) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, setFieldValue(connection, shareId, 'publicUpload', isPublicUpload)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        },
        expireDate: function (expireDate) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, setFieldValue(connection, shareId, 'expireDate', expireDate)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        },
        note: function (note) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, setFieldValue(connection, shareId, 'note', note)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
    };
    function setFieldValue(connection, shareId, field, value) {
        return __awaiter(this, void 0, void 0, function () {
            var editedShare, error_22;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, promisifiedEditShare.call(connection, shareId, field, String(value))];
                    case 1:
                        editedShare = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_22 = _a.sent();
                        editedShare = helper_1.rejectWithOcsError(error_22, {
                            message: "Unable to edit '" + field + "' of share",
                            identifier: shareId,
                            useMeta: true,
                            expectedErrorCodes: [400, 404]
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, editedShare];
                }
            });
        });
    }
}
exports.editShare = editShare;
//# sourceMappingURL=ocs.js.map