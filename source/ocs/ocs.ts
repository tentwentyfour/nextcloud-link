import { ocsGetActivities }     from './activity';
import { OcsConnection }        from './ocs-connection';
import { promisify }            from 'util';

import {
  OcsActivity,
  OcsUser,
  OcsNewUser,
} from './types';

import {
  ocsAddRemoveUserForGroup,
  ocsSetUserSubAdmin,
  ocsSetUserEnabled,
  ocsGetUserGroups,
  ocsDeleteUser,
  ocsListUsers,
  ocsEditUser,
  ocsAddUser,
  ocsGetUser,
} from './user';

import {
  NextcloudClientInterface,
  ConnectionOptions,
} from '../types';

const promisifiedGetActivities = promisify(ocsGetActivities);

const promisifiedAddRemoveUserForGroup = promisify(ocsAddRemoveUserForGroup);
const promisifiedSetUserSubAdmin       = promisify(ocsSetUserSubAdmin);
const promisifiedSetUserEnabled        = promisify(ocsSetUserEnabled);
const promisifiedGetUserGroups         = promisify(ocsGetUserGroups);
const promisifiedDeleteUser            = promisify(ocsDeleteUser);
const promisifiedListUsers             = promisify(ocsListUsers);
const promisifiedEditUser              = promisify(ocsEditUser);
const promisifiedAddUser               = promisify(ocsAddUser);
const promisifiedGetUser               = promisify(ocsGetUser);

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
  objectId: number | string,
  sort?: 'asc' | 'desc',
  limit?: number,
  sinceActivityId?: number
) : Promise<OcsActivity[]> {
  let activities : OcsActivity[];
  try {
    activities = await promisifiedGetActivities.call(
      connection,
      (typeof objectId === 'string' ? parseInt(objectId, 10) : objectId),
      sort || 'desc',
      limit || -1,
      sinceActivityId || -1
    );
  } catch (error) {
    let message = error.message;
    switch (error.code) {
      case 204:
        message = 'The user has selected no activities to be listed in the stream';
        break;
      case 304:
        message = 'ETag/If-None-Match are the same or the end of the activity list was reached';
        break;
      case 403:
        message = 'The offset activity belongs to a different user or the user is not logged in';
        break;
      case 404:
        message = 'The filter is unknown';
        break;
    }

    return Promise.reject({ message, code: error.code });
  }

  return activities;
}

export async function getUser(
  connection: OcsConnection,
  userId: string
) : Promise<OcsUser> {
  let user : OcsUser;

  try {
    user = await promisifiedGetUser.call(connection, userId);
  } catch (error) {
    return Promise.reject(error);
  }

  return user;
}

export async function listUsers(
  connection: OcsConnection,
): Promise<string[]> {
  let users: string[] = null;

  try {
    users = await promisifiedListUsers.call(connection);
  } catch (error) {
    return Promise.reject(error);
  }

  return users;
}

export async function setUserEnabled(
  connection: OcsConnection,
  userId: string,
  isEnabled: boolean
): Promise<void> {
  // promisifiedSetUserEnabled
  await promisifiedSetUserEnabled.call(connection);
}

export async function deleteUser(
  connection: OcsConnection,
  userId: string
): Promise<boolean> {
  let userDeleted = false;

  try {
    userDeleted = await promisifiedDeleteUser.call(connection, userId);
  } catch (error) {
    if (error.code === 400 && error.meta && error.meta.statuscode === 101) {
      return Promise.reject({ code: 400, message: `Unable to delete user '${userId}', did it exist?` });
    }

    return Promise.reject(error);
  }

  return userDeleted;
}

export async function addUser(
  connection: OcsConnection,
  user: OcsNewUser,
): Promise<boolean> {
  let userAdded = false;

  try {
    userAdded = await promisifiedAddUser.call(connection, user);
  } catch (error) {
    if (error.code === 400 && error.meta && error.meta.message) {
      return Promise.reject({ code: 400, message: error.meta.message });
    }

    return Promise.reject(error);
  }

  return userAdded;
}

export async function editUser(
  connection: OcsConnection,
): Promise<void> {
  // promisifiedEditUser
  await promisifiedEditUser.call(connection);
}

//! TODO:
//! TODO:
//! TODO:
//! TODO: Fix all try-catch blocks that have unneeded assignments after throw.
//! TODO:
//! TODO:
//! TODO:

export async function getUserGroups(
  connection: OcsConnection,
  userId: string
): Promise<string[]> {
  let groups: string[] = null;

  try {
    groups = await promisifiedGetUserGroups.call(connection, userId);
  } catch (error) {
    if (error.code === 400 && error.meta && error.meta.message) {
      return Promise.reject({ code: 400, message: error.meta.message });
    }

    return Promise.reject(error);
  }

  return groups;
}

export async function addRemoveUserForGroup(
  connection: OcsConnection,
  userId: string,
  groupId: string,
  toAdd: boolean
): Promise<boolean> {
  let userModifiedForGroup = false;

  try {
    userModifiedForGroup = await promisifiedAddRemoveUserForGroup.call(connection, userId, groupId, toAdd);
  } catch (error) {
    if (error.code === 400 && error.meta && error.meta.statuscode) {
      let message = '';
      switch (error.meta.statuscode) {
        case 101:
          message = 'No group specified';
          break;
        case 102:
          message = `Group '${groupId}' does not exist`;
          break;
        case 103:
          message = `User '${userId}' does not exist`;
          break;
        case 104:
          message = 'Insufficient privileges';
          break;
        case 105:
          message = 'Failed to add user to group';
          break;
      }

      return Promise.reject({ message, code: 400 });
    }

    return Promise.reject(error);
  }

  return userModifiedForGroup;
}

export async function addRemoveUserSubAdminForGroup(
  connection: OcsConnection,
  userId: string,
  groupId: string,
  toAdd: boolean
): Promise<void> {
  // promisifiedSetUserSubAdmin×
  await promisifiedSetUserSubAdmin.call(connection);
}
