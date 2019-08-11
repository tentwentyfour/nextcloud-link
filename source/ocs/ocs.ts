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
  NextcloudClientInterface,
  ConnectionOptions,
} from '../types';

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
  let activities : OcsActivity[];
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
      throw error;
    }

    activities = null;
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
    if (error.code !== 404) {
      throw error;
    }

    user = null;
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
    throw error;

    users = null;
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
  let userDeleted = false;

  try {
    userDeleted = await promisifiedDeleteUser.call(connection, userId);
  } catch (error) {
    if (error.code === 400 && error.meta && error.meta.statuscode === 101) {
      throw { code: 400, message: `Unable to delete user '${userId}', did it exist?` };
    }

    throw error;

    userDeleted = false;
  }

  return userDeleted;
}

export async function addUser(
  connection: OcsConnection,
  user: OcsNewUser,
): Promise<boolean> {
  // promisifiedAddUser
  let userAdded = false;

  try {
    userAdded = await promisifiedAddUser.call(connection, user);
  } catch (error) {
    if (error.code === 400 && error.meta && error.meta.message) {
      throw { code: 400, message: error.meta.message };
    }

    throw error;

    userAdded = false;
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
