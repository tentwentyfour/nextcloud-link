import { ocsGetActivities }     from './activity';
import { OcsConnection }        from './ocs-connection';
import { promisify }            from 'util';

import {
  OcsActivity,
  OcsUser,
  OcsNewUser,
} from './types';

import {
  ocsGetUser,
  ocsListUsers,
  ocsSetUserEnabled,
  ocsDeleteUser,
  ocsAddUser,
  ocsEditUser,
  ocsGetUserGroups,
  ocsAddUserToGroup,
  ocsRemoveUserFromGroup,
  ocsSetUserSubAdmin,
} from './user';

import {
  ocsListGroups,
  ocsAddGroup,
  ocsDeleteGroup,
  ocsGetGroupUsers,
  ocsGetGroupSubAdmins,
} from './group';

import {
  NextcloudClientInterface,
  ConnectionOptions,
} from '../types';

import { OcsError } from '../errors';

const promisifiedGetActivities = promisify(ocsGetActivities);

const promisifiedGetUser = promisify(ocsGetUser);
const promisifiedListUsers = promisify(ocsListUsers);
const promisifiedSetUserEnabled = promisify(ocsSetUserEnabled);
const promisifiedDeleteUser = promisify(ocsDeleteUser);
const promisifiedAddUser = promisify(ocsAddUser);
const promisifiedEditUser = promisify(ocsEditUser);
const promisifiedGetUserGroups = promisify(ocsGetUserGroups);
const promisifiedAddUserToGroup = promisify(ocsAddUserToGroup);
const promisifiedRemoveUserFromGroup = promisify(ocsRemoveUserFromGroup);
const promisifiedSetUserSubAdmin = promisify(ocsSetUserSubAdmin);

const promisifiedListGroups = promisify(ocsListGroups);
const promisifiedAddGroup = promisify(ocsAddGroup);
const promisifiedDeleteGroup = promisify(ocsDeleteGroup);
const promisifiedGetGroupUsers = promisify(ocsGetGroupUsers);
const promisifiedGetGroupSubAdmins = promisify(ocsGetGroupSubAdmins);

export function configureOcsConnection(options: ConnectionOptions): void {
  const self: NextcloudClientInterface = this;

  self.ocsConnection = new OcsConnection({
    url:           options.url,
    username:      options.username,
    password:      options.password
  });
}

export async function getActivities(
  connection: OcsConnection,
  fileId: number | string,
  sort?: 'asc' | 'desc',
  limit?: number,
  sinceActivityId?: number
) : Promise<OcsActivity[]> {
  let activities: Promise<OcsActivity[]>;
  try {
    activities = await promisifiedGetActivities.call(
      connection,
      (typeof fileId === 'string' ? parseInt(fileId, 10) : fileId),
      sort || 'desc',
      limit || -1,
      sinceActivityId || -1
    );
  } catch (error) {
    if (error.code !== 304) {
      Promise.reject(error);
    }
    // TODO: Proper error messages.

    activities = Promise.reject(error);
  }

  return activities;
}

export async function getUser(
  connection: OcsConnection,
  userId: string
) : Promise<OcsUser> {
  let user: Promise<OcsUser>;

  try {
    user = await promisifiedGetUser.call(connection, userId);
  } catch (error) {
    if (error.code !== 404) {
      throw error;
    }
    // TODO: Proper error messages.

    user = Promise.reject(error);
  }

  return user;
}

export async function listUsers(
  connection: OcsConnection,
): Promise<string[]> {
  let users: Promise<string[]> = null;

  try {
    users = await promisifiedListUsers.call(connection);
  } catch (error) {
    // TODO: Proper error messages.

    users = Promise.reject(error);
  }

  return users;
}

export async function setUserEnabled(
  connection: OcsConnection,
): Promise<void> {
  // promisifiedSetUserEnabled
  await promisifiedSetUserEnabled.call(connection);
}

export async function deleteUser(
  connection: OcsConnection,
  userId: string
): Promise<boolean> {
  let userDeleted: Promise<boolean>;

  try {
    userDeleted = await promisifiedDeleteUser.call(connection, userId);
  } catch (error) {
    // TODO: Proper error messages.
    if (error.code === 400 && error.meta && error.meta.statuscode === 101) {
      Promise.reject({ code: 400, message: `Unable to delete user '${userId}', did it exist?` });
    }

    userDeleted = Promise.reject(error);
  }

  return userDeleted;
}

export async function addUser(
  connection: OcsConnection,
  user: OcsNewUser,
): Promise<boolean> {
  let userAdded: Promise<boolean>;

  try {
    userAdded = await promisifiedAddUser.call(connection, user);
  } catch (error) {
    // TODO: Proper error messages.
    if (error.code === 400 && error.meta && error.meta.message) {
      userAdded = Promise.reject({ code: 400, message: error.meta.message });
    } else {
      userAdded = Promise.reject(error);
    }
  }

  return userAdded;
}

export async function editUser(
  connection: OcsConnection,
): Promise<void> {
  // promisifiedEditUser
  await promisifiedEditUser.call(connection);
}

export async function getUserGroups(
  connection: OcsConnection,
): Promise<void> {
  // promisifiedGetUserGroups
  await promisifiedGetUserGroups.call(connection);
}

export async function addUserToGroup(
  connection: OcsConnection,
): Promise<void> {
  // promisifiedAddUserToGroup
  await promisifiedAddUserToGroup.call(connection);
}

export async function removeUserFromGroup(
  connection: OcsConnection,
): Promise<void> {
  // promisifiedRemoveUserFromGroup
  await promisifiedRemoveUserFromGroup.call(connection);
}

export async function setUserSubAdmin(
  connection: OcsConnection,
): Promise<void> {
  // promisifiedSetUserSubAdmin×
  await promisifiedSetUserSubAdmin.call(connection);
}

export async function listGroups(
  connection: OcsConnection,
  search?: string,
  limit?: number,
  offset?: number
): Promise<string[]> {
  let groups: Promise<string[]> = null;

  try {
    groups = await promisifiedListGroups.call(
      connection,
      search || '',
      Number.isInteger(limit)  ? limit  : -1,
      Number.isInteger(offset) ? offset : -1
    );
  } catch (error) {
    groups = Promise.reject(error);
  }

  return groups;
}

export async function addGroup(
  connection: OcsConnection,
  groupId: string,
): Promise<boolean> {
  let groupAdded: Promise<boolean>;

  try {
    groupAdded = await promisifiedAddGroup.call(connection, groupId);
  } catch (error) {
    if (error.code === 400 && error.meta && error.meta.statuscode) {
      let message;
      switch (error.meta.statuscode) {
        case 101:
          message = 'invalid input data';
          break;
        case 102:
          message = 'group already exists';
          break;
        case 103:
          message = 'failed to add the group';
          break;
        default:
          message = error.meta.message;
          break;
      }

      groupAdded = Promise.reject(new OcsError({
        message: `Unable to add group '${groupId}': ${message}`,
        statusCode: error.meta.statuscode
      }));
    } else {
      groupAdded = Promise.reject(error);
    }
  }

  return groupAdded;
}

export async function deleteGroup(
  connection: OcsConnection,
  groupId: string,
): Promise<boolean> {
  let groupDeleted: Promise<boolean>;

  try {
    groupDeleted = await promisifiedDeleteGroup.call(connection, groupId);
  } catch (error) {
    if (error.code === 400 && error.meta && error.meta.statuscode) {
      let message;
      switch (error.meta.statuscode) {
        case 101:
          message = 'group doesn\'t exist';
          break;
        case 102:
          message = 'failed to delete group';
          break;
        default:
          message = error.meta.message;
          break;
      }

      groupDeleted = Promise.reject(new OcsError({
        message: `Unable to delete group '${groupId}': ${message}`,
        statusCode: error.meta.statuscode
      }));
    } else {
      groupDeleted = Promise.reject(error);
    }
  }

  return groupDeleted;
}

export async function getGroupUsers(
  connection: OcsConnection,
  groupId: string,
): Promise<string[]> {
  let users: Promise<string[]>;

  try {
    users = await promisifiedGetGroupUsers.call(connection, groupId);
  } catch (error) {
    if (error.code === 404) {
      users = Promise.reject(new OcsError({
        message: `Unable to list users for group '${groupId}': the group could not be found`,
        statusCode: 404
      }));
    } else {
      users = Promise.reject(error);
    }
  }

  return users;
}

export async function getGroupSubAdmins(
  connection: OcsConnection,
  groupId: string,
): Promise<string[]> {
  let subAdmins: Promise<string[]>;

  try {
    subAdmins = await promisifiedGetGroupSubAdmins.call(connection, groupId);
  } catch (error) {
    if (error.code === 400 && error.meta && error.meta.statuscode) {
      let message;
      switch (error.meta.statuscode) {
        case 101:
          message = 'group doesn\'t exist';
          break;
        case 102:
          message = 'unknown failure';
          break;
        default:
          message = error.meta.message;
          break;
      }

      subAdmins = Promise.reject(new OcsError({
        message: `Unable to list sub-admins for group '${groupId}': ${message}`,
        statusCode: error.meta.statuscode
      }));
    } else {
      subAdmins = Promise.reject(error);
    }
  }

  return subAdmins;
}
