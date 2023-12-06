"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameGroupfolder = exports.setGroupfolderQuota = exports.setGroupfolderManageACL = exports.enableGroupfolderACL = exports.setGroupfolderPermissions = exports.removeGroupfolderGroup = exports.addGroupfolderGroup = exports.removeGroupfolder = exports.addGroupfolder = exports.getGroupfolder = exports.getGroupfolders = exports.editShare = exports.addShare = exports.deleteShare = exports.getShare = exports.getShares = exports.getGroupSubAdmins = exports.getGroupUsers = exports.deleteGroup = exports.addGroup = exports.listGroups = exports.addUser = exports.deleteUser = exports.listUsers = exports.addRemoveUserSubAdminForGroup = exports.addRemoveUserForGroup = exports.resendUserWelcomeEmail = exports.getUserSubAdmins = exports.getUserGroups = exports.editUser = exports.setUserEnabled = exports.getUser = exports.getActivities = exports.configureOcsConnection = void 0;
const helper_1 = require("./helper");
const activity_1 = require("./activity");
const ocs_connection_1 = require("./ocs-connection");
const types_1 = require("./types");
const user_1 = require("./user");
const group_1 = require("./group");
const share_1 = require("./share");
const groupfolders_1 = require("./groupfolders");
const promisifiedGetActivities = (0, helper_1.promisify)(activity_1.ocsGetActivities);
const promisifiedResendUserWelcomeEmail = (0, helper_1.promisify)(user_1.ocsResendUserWelcomeEmail);
const promisifiedAddRemoveUserForGroup = (0, helper_1.promisify)(user_1.ocsAddRemoveUserForGroup);
const promisifiedGetUserSubAdmins = (0, helper_1.promisify)(user_1.ocsGetUserSubAdmins);
const promisifiedSetUserSubAdmin = (0, helper_1.promisify)(user_1.ocsSetUserSubAdmin);
const promisifiedSetUserEnabled = (0, helper_1.promisify)(user_1.ocsSetUserEnabled);
const promisifiedGetUserGroups = (0, helper_1.promisify)(user_1.ocsGetUserGroups);
const promisifiedDeleteUser = (0, helper_1.promisify)(user_1.ocsDeleteUser);
const promisifiedListUsers = (0, helper_1.promisify)(user_1.ocsListUsers);
const promisifiedEditUser = (0, helper_1.promisify)(user_1.ocsEditUser);
const promisifiedAddUser = (0, helper_1.promisify)(user_1.ocsAddUser);
const promisifiedGetUser = (0, helper_1.promisify)(user_1.ocsGetUser);
const promisifiedGetGroupSubAdmins = (0, helper_1.promisify)(group_1.ocsGetGroupSubAdmins);
const promisifiedGetGroupUsers = (0, helper_1.promisify)(group_1.ocsGetGroupUsers);
const promisifiedDeleteGroup = (0, helper_1.promisify)(group_1.ocsDeleteGroup);
const promisifiedListGroups = (0, helper_1.promisify)(group_1.ocsListGroups);
const promisifiedAddGroup = (0, helper_1.promisify)(group_1.ocsAddGroup);
const promisifiedDeleteShare = (0, helper_1.promisify)(share_1.ocsDeleteShare);
const promisifiedEditShare = (0, helper_1.promisify)(share_1.ocsEditShare);
const promisifiedGetShares = (0, helper_1.promisify)(share_1.ocsGetShares);
const promisifiedGetShare = (0, helper_1.promisify)(share_1.ocsGetShare);
const promisifiedAddShare = (0, helper_1.promisify)(share_1.ocsAddShare);
const promisifiedGetGroupfolders = (0, helper_1.promisify)(groupfolders_1.ocsGetGroupfolders);
const promisifiedGetGroupfolder = (0, helper_1.promisify)(groupfolders_1.ocsGetGroupfolder);
const promisifiedAddGroupfolder = (0, helper_1.promisify)(groupfolders_1.ocsAddGroupfolder);
const promisifiedRemoveGroupfolder = (0, helper_1.promisify)(groupfolders_1.ocsRemoveGroupfolder);
const promisifiedAddGroupfolderGroup = (0, helper_1.promisify)(groupfolders_1.ocsAddGroupfolderGroup);
const promisifiedRemoveGroupfolderGroup = (0, helper_1.promisify)(groupfolders_1.ocsRemoveGroupfolderGroup);
const promisifiedEnableOrDisableGroupfolderACL = (0, helper_1.promisify)(groupfolders_1.ocsEnableOrDisableGroupfolderACL);
const promisifiedRenameGroupfolder = (0, helper_1.promisify)(groupfolders_1.ocsRenameGroupfolder);
const promisifiedSetGroupfolderQuota = (0, helper_1.promisify)(groupfolders_1.ocsSetGroupfolderQuota);
const promisifiedSetGroupfolderPermissions = (0, helper_1.promisify)(groupfolders_1.ocsSetGroupfolderPermissions);
const promisifiedSetGroupfolderManageACL = (0, helper_1.promisify)(groupfolders_1.ocsSetGroupfolderManageACL);
function configureOcsConnection(options) {
    const self = this;
    self.ocsConnection = new ocs_connection_1.OcsConnection({
        url: options.url,
        username: options.username,
        password: options.password
    });
}
exports.configureOcsConnection = configureOcsConnection;
async function getActivities(connection, fileId, sort, limit, sinceActivityId) {
    let activities;
    try {
        activities = await promisifiedGetActivities.call(connection, (typeof fileId === 'string' ? parseInt(fileId, 10) : fileId), sort || 'desc', limit || -1, sinceActivityId || -1);
    }
    catch (error) {
        activities = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to get activities for',
            identifier: fileId,
            useMeta: false,
            customErrors: {
                [204]: 'The user has selected no activities to be listed in the stream',
                [304]: 'ETag/If-None-Match are the same or the end of the activity list was reached',
                [403]: 'The offset activity belongs to a different user or the user is not logged in',
                [404]: 'The filter is unknown'
            }
        });
    }
    return activities;
}
exports.getActivities = getActivities;
async function getUser(connection, userId) {
    let user;
    try {
        user = await promisifiedGetUser.call(connection, userId);
    }
    catch (error) {
        user = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to find user',
            identifier: userId,
            useMeta: false
        });
    }
    return user;
}
exports.getUser = getUser;
async function setUserEnabled(connection, userId, isEnabled) {
    let success;
    try {
        success = await promisifiedSetUserEnabled.call(connection, userId, isEnabled);
    }
    catch (error) {
        success = (0, helper_1.rejectWithOcsError)(error, {
            message: `Unable to ${isEnabled ? 'enable' : 'disable'} user`,
            identifier: userId,
            useMeta: true,
            customErrors: {
                [101]: 'user does not exist'
            }
        });
    }
    return success;
}
exports.setUserEnabled = setUserEnabled;
async function editUser(connection, userId, field, value) {
    let userEdited;
    try {
        userEdited = await promisifiedEditUser.call(connection, userId, field, value);
    }
    catch (error) {
        userEdited = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to edit user',
            identifier: userId,
            useMeta: true,
            expectedErrorCodes: [400, 401],
            customErrors: {
                [101]: 'user not found',
                [997]: 'possible reasons: Does it exist? Do you have the right permissions? Is the field valid?'
            }
        });
    }
    return userEdited;
}
exports.editUser = editUser;
async function getUserGroups(connection, userId) {
    let groups;
    try {
        groups = await promisifiedGetUserGroups.call(connection, userId);
    }
    catch (error) {
        groups = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to get groups for user',
            identifier: userId,
            useMeta: false
        });
    }
    return groups;
}
exports.getUserGroups = getUserGroups;
async function getUserSubAdmins(connection, userId) {
    let subAdmins;
    try {
        subAdmins = await promisifiedGetUserSubAdmins.call(connection, userId);
    }
    catch (error) {
        subAdmins = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to get sub-admins for user',
            identifier: userId,
            useMeta: true,
            expectedErrorCodes: [400],
            customErrors: {
                [101]: 'user does not exist'
            }
        });
    }
    return subAdmins;
}
exports.getUserSubAdmins = getUserSubAdmins;
async function resendUserWelcomeEmail(connection, userId) {
    let success;
    try {
        success = await promisifiedResendUserWelcomeEmail.call(connection, userId);
    }
    catch (error) {
        success = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to resend welcome email for user',
            identifier: userId,
            useMeta: true,
            expectedErrorCodes: [400],
            customErrors: {
                [101]: 'email address not available',
                [102]: 'sending email failed'
            }
        });
    }
    return success;
}
exports.resendUserWelcomeEmail = resendUserWelcomeEmail;
async function addRemoveUserForGroup(connection, userId, groupId, toAdd) {
    let userModifiedForGroup;
    try {
        userModifiedForGroup = await promisifiedAddRemoveUserForGroup.call(connection, userId, groupId, toAdd);
    }
    catch (error) {
        userModifiedForGroup = (0, helper_1.rejectWithOcsError)(error, {
            message: `Unable to ${toAdd ? 'add' : 'remove'} user '${userId}' ${toAdd ? 'to' : 'from'} group`,
            identifier: groupId,
            useMeta: true,
            expectedErrorCodes: [400],
            customErrors: {
                [101]: 'no group specified',
                [102]: 'group does not exist',
                [103]: 'user does not exist',
                [104]: 'insufficient privileges',
            }
        });
    }
    return userModifiedForGroup;
}
exports.addRemoveUserForGroup = addRemoveUserForGroup;
async function addRemoveUserSubAdminForGroup(connection, userId, groupId, toAdd) {
    let subAdminModifiedForGroup;
    try {
        subAdminModifiedForGroup = await promisifiedSetUserSubAdmin.call(connection, userId, groupId, toAdd);
    }
    catch (error) {
        let customErrors = {};
        if (toAdd) {
            customErrors[101] = 'user does not exist';
            customErrors[102] = 'group does not exist';
        }
        else {
            customErrors[101] = 'user or group does not exist';
            customErrors[102] = 'user is not a sub-admin of the group';
        }
        subAdminModifiedForGroup = (0, helper_1.rejectWithOcsError)(error, {
            customErrors,
            message: `Unable to ${toAdd ? 'add' : 'remove'} user '${userId}' as sub-admin ${toAdd ? 'to' : 'from'} group`,
            identifier: groupId,
            useMeta: true,
            expectedErrorCodes: [400],
        });
    }
    return subAdminModifiedForGroup;
}
exports.addRemoveUserSubAdminForGroup = addRemoveUserSubAdminForGroup;
async function listUsers(connection, search, limit, offset) {
    let users;
    try {
        users = await promisifiedListUsers.call(connection, search || '', Number.isInteger(limit) ? limit : -1, Number.isInteger(offset) ? offset : -1);
    }
    catch (error) {
        users = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to list users',
            useMeta: false
        });
    }
    return users;
}
exports.listUsers = listUsers;
async function deleteUser(connection, userId) {
    let userDeleted;
    try {
        userDeleted = await promisifiedDeleteUser.call(connection, userId);
    }
    catch (error) {
        userDeleted = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to delete user',
            identifier: userId,
            useMeta: true,
            expectedErrorCodes: [400],
            customErrors: {
                [101]: 'user does not exist'
            }
        });
    }
    return userDeleted;
}
exports.deleteUser = deleteUser;
async function addUser(connection, user) {
    let userAdded;
    try {
        userAdded = await promisifiedAddUser.call(connection, user);
    }
    catch (error) {
        userAdded = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to add user',
            identifier: (user && user.userid ? user.userid : ''),
            useMeta: true,
            expectedErrorCodes: [400],
            customErrors: {
                [102]: 'username already exists',
                [103]: 'unknown error occurred whilst adding the user',
                [104]: 'group does not exist',
                [105]: 'insufficient privileges for group',
                [106]: 'no group specified (required for sub-admins',
                [108]: 'password and email empty. Must set password or an email',
                [109]: 'invitation email cannot be send'
            }
        });
    }
    return userAdded;
}
exports.addUser = addUser;
async function listGroups(connection, search, limit, offset) {
    let groups;
    try {
        groups = await promisifiedListGroups.call(connection, search || '', Number.isInteger(limit) ? limit : -1, Number.isInteger(offset) ? offset : -1);
    }
    catch (error) {
        groups = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to list groups',
            useMeta: false
        });
    }
    return groups;
}
exports.listGroups = listGroups;
async function addGroup(connection, groupId) {
    let groupAdded;
    try {
        groupAdded = await promisifiedAddGroup.call(connection, groupId);
    }
    catch (error) {
        groupAdded = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to add group',
            identifier: groupId,
            useMeta: true,
            expectedErrorCodes: [400],
            customErrors: {
                [102]: 'group already exists',
                [103]: 'failed to add the group'
            }
        });
    }
    return groupAdded;
}
exports.addGroup = addGroup;
async function deleteGroup(connection, groupId) {
    let groupDeleted;
    try {
        groupDeleted = await promisifiedDeleteGroup.call(connection, groupId);
    }
    catch (error) {
        groupDeleted = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to delete group',
            identifier: groupId,
            useMeta: true,
            expectedErrorCodes: [400],
            customErrors: {
                [101]: 'group does not exist',
                [102]: 'failed to delete group'
            }
        });
    }
    return groupDeleted;
}
exports.deleteGroup = deleteGroup;
async function getGroupUsers(connection, groupId) {
    let users;
    try {
        users = await promisifiedGetGroupUsers.call(connection, groupId);
    }
    catch (error) {
        users = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to list users for group',
            identifier: groupId,
            useMeta: false,
            expectedErrorCodes: [404],
            customErrors: {
                [404]: 'the group could not be found'
            }
        });
    }
    return users;
}
exports.getGroupUsers = getGroupUsers;
async function getGroupSubAdmins(connection, groupId) {
    let subAdmins;
    try {
        subAdmins = await promisifiedGetGroupSubAdmins.call(connection, groupId);
    }
    catch (error) {
        subAdmins = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to list sub-admins for group',
            identifier: groupId,
            useMeta: true,
            expectedErrorCodes: [400],
            customErrors: {
                [101]: 'group does not exist'
            }
        });
    }
    return subAdmins;
}
exports.getGroupSubAdmins = getGroupSubAdmins;
async function getShares(connection, path, includeReshares, showForSubFiles) {
    let shares;
    try {
        shares = await promisifiedGetShares.call(connection, path || '', (includeReshares !== undefined ? includeReshares : false), (showForSubFiles !== undefined ? showForSubFiles : false));
    }
    catch (error) {
        shares = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to get shares for',
            identifier: path,
            useMeta: true,
            expectedErrorCodes: [400, 404],
            customErrors: {
                [400]: 'unable to show sub-files as this is not a directory',
                [404]: 'file/folder doesn\'t exist'
            }
        });
    }
    return shares;
}
exports.getShares = getShares;
async function getShare(connection, shareId) {
    let share;
    try {
        share = await promisifiedGetShare.call(connection, shareId);
    }
    catch (error) {
        share = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to get share',
            identifier: shareId,
            useMeta: true,
            expectedErrorCodes: [404]
        });
    }
    return share;
}
exports.getShare = getShare;
async function deleteShare(connection, shareId) {
    let shareDeleted;
    try {
        shareDeleted = await promisifiedDeleteShare.call(connection, shareId);
    }
    catch (error) {
        shareDeleted = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to delete share',
            identifier: shareId,
            useMeta: true,
            expectedErrorCodes: [404],
            customErrors: {
                [404]: 'invalid shareId or the share doesn\'t exist'
            }
        });
    }
    return shareDeleted;
}
exports.deleteShare = deleteShare;
async function addShare(connection, path, shareType, shareWith, permissions, password, publicUpload) {
    let addedShare;
    try {
        addedShare = await promisifiedAddShare.call(connection, path, shareType, shareWith || '', (permissions !== undefined ? permissions : types_1.OcsSharePermissions.default), password || '', (publicUpload !== undefined ? publicUpload : false));
    }
    catch (error) {
        addedShare = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to add share',
            identifier: path,
            useMeta: true,
            expectedErrorCodes: [403, 404]
        });
    }
    return addedShare;
}
exports.addShare = addShare;
function editShare(connection, shareId) {
    return {
        async permissions(permissions) {
            return await setFieldValue(connection, shareId, 'permissions', permissions);
        },
        async password(password) {
            return await setFieldValue(connection, shareId, 'password', password);
        },
        async publicUpload(isPublicUpload) {
            return await setFieldValue(connection, shareId, 'publicUpload', isPublicUpload);
        },
        async expireDate(expireDate) {
            return await setFieldValue(connection, shareId, 'expireDate', expireDate);
        },
        async note(note) {
            return await setFieldValue(connection, shareId, 'note', note);
        }
    };
    async function setFieldValue(connection, shareId, field, value) {
        let editedShare;
        try {
            editedShare = await promisifiedEditShare.call(connection, shareId, field, String(value));
        }
        catch (error) {
            editedShare = (0, helper_1.rejectWithOcsError)(error, {
                message: `Unable to edit '${field}' of share`,
                identifier: shareId,
                useMeta: true,
                expectedErrorCodes: [400, 404]
            });
        }
        return editedShare;
    }
}
exports.editShare = editShare;
async function getGroupfolders(connection) {
    let groupfolders;
    try {
        groupfolders = await promisifiedGetGroupfolders.call(connection);
    }
    catch (error) {
        groupfolders = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to list groupfolders',
            useMeta: true,
            expectedErrorCodes: [500],
        });
    }
    return groupfolders;
}
exports.getGroupfolders = getGroupfolders;
async function getGroupfolder(connection, groupfolderId) {
    let groupfolder;
    try {
        groupfolder = await promisifiedGetGroupfolder.call(connection, groupfolderId);
    }
    catch (error) {
        groupfolder = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to get groupfolder',
            identifier: groupfolderId,
            useMeta: true,
            expectedErrorCodes: [500],
        });
    }
    return groupfolder;
}
exports.getGroupfolder = getGroupfolder;
async function addGroupfolder(connection, mountpoint) {
    let addedGroupfolderId;
    try {
        addedGroupfolderId = await promisifiedAddGroupfolder.call(connection, mountpoint);
    }
    catch (error) {
        addedGroupfolderId = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to create groupfolder',
            identifier: mountpoint,
            useMeta: true,
            expectedErrorCodes: [500],
        });
    }
    return addedGroupfolderId;
}
exports.addGroupfolder = addGroupfolder;
async function removeGroupfolder(connection, groupfolderId) {
    let groupfolderDeleted;
    try {
        groupfolderDeleted = await promisifiedRemoveGroupfolder.call(connection, groupfolderId);
    }
    catch (error) {
        groupfolderDeleted = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to delete groupfolder',
            identifier: groupfolderId,
            useMeta: true,
            expectedErrorCodes: [500],
        });
    }
    return groupfolderDeleted;
}
exports.removeGroupfolder = removeGroupfolder;
async function addGroupfolderGroup(connection, groupfolderId, groupId) {
    let groupfolderGroupAdded;
    try {
        groupfolderGroupAdded = await promisifiedAddGroupfolderGroup.call(connection, groupfolderId, groupId);
    }
    catch (error) {
        groupfolderGroupAdded = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to add group to groupfolder',
            identifier: groupfolderId,
            useMeta: true,
            expectedErrorCodes: [500],
        });
    }
    return groupfolderGroupAdded;
}
exports.addGroupfolderGroup = addGroupfolderGroup;
async function removeGroupfolderGroup(connection, groupfolderId, groupId) {
    let groupfolderGroupRemoved;
    try {
        groupfolderGroupRemoved = await promisifiedRemoveGroupfolderGroup.call(connection, groupfolderId, groupId);
    }
    catch (error) {
        groupfolderGroupRemoved = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to remove group from groupfolder',
            identifier: groupfolderId,
            useMeta: true,
            expectedErrorCodes: [500],
        });
    }
    return groupfolderGroupRemoved;
}
exports.removeGroupfolderGroup = removeGroupfolderGroup;
async function setGroupfolderPermissions(connection, groupfolderId, groupId, permissions) {
    let groupfolderPermissionsSet;
    try {
        groupfolderPermissionsSet = await promisifiedSetGroupfolderPermissions.call(connection, groupfolderId, groupId, permissions);
    }
    catch (error) {
        groupfolderPermissionsSet = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to set groupfolder permissions',
            identifier: groupfolderId,
            useMeta: true,
            expectedErrorCodes: [500],
        });
    }
    return groupfolderPermissionsSet;
}
exports.setGroupfolderPermissions = setGroupfolderPermissions;
async function enableGroupfolderACL(connection, groupfolderId, enable) {
    let groupfolderACLEnabled;
    try {
        groupfolderACLEnabled = await promisifiedEnableOrDisableGroupfolderACL.call(connection, groupfolderId, enable);
    }
    catch (error) {
        groupfolderACLEnabled = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to enable ACL for groupfolder',
            identifier: groupfolderId,
            useMeta: true,
            expectedErrorCodes: [500],
        });
    }
    return groupfolderACLEnabled;
}
exports.enableGroupfolderACL = enableGroupfolderACL;
async function setGroupfolderManageACL(connection, groupfolderId, type, id, manageACL) {
    let groupfolderManageACLSet;
    try {
        groupfolderManageACLSet = await promisifiedSetGroupfolderManageACL.call(connection, groupfolderId, type, id, manageACL);
    }
    catch (error) {
        groupfolderManageACLSet = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to set groupfolder manage ACL settings',
            identifier: groupfolderId,
            useMeta: true,
            expectedErrorCodes: [500],
        });
    }
    return groupfolderManageACLSet;
}
exports.setGroupfolderManageACL = setGroupfolderManageACL;
async function setGroupfolderQuota(connection, groupfolderId, quota) {
    let groupfolderQuotaSet;
    try {
        groupfolderQuotaSet = await promisifiedSetGroupfolderQuota.call(connection, groupfolderId, quota);
    }
    catch (error) {
        groupfolderQuotaSet = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to set groupfolder quota',
            identifier: groupfolderId,
            useMeta: true,
            expectedErrorCodes: [500],
        });
    }
    return groupfolderQuotaSet;
}
exports.setGroupfolderQuota = setGroupfolderQuota;
async function renameGroupfolder(connection, groupfolderId, mountpoint) {
    let groupfolderRenamed;
    try {
        groupfolderRenamed = await promisifiedRenameGroupfolder.call(connection, groupfolderId, mountpoint);
    }
    catch (error) {
        groupfolderRenamed = (0, helper_1.rejectWithOcsError)(error, {
            message: 'Unable to rename groupfolder',
            identifier: groupfolderId,
            useMeta: true,
            expectedErrorCodes: [500],
        });
    }
    return groupfolderRenamed;
}
exports.renameGroupfolder = renameGroupfolder;
