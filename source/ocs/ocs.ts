import { ocsGetActivities }     from './activity';
import { OcsConnection }        from './ocs-connection';
import { promisify }            from 'util';

import {
  OcsEditUserField,
  OcsActivity,
  OcsNewUser,
  OcsUser,
} from './types';

import {
  ocsResendUserWelcomeEmail,
  ocsAddRemoveUserForGroup,
  ocsGetUserSubAdmins,
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
  ocsGetGroupSubAdmins,
  ocsGetGroupUsers,
  ocsDeleteGroup,
  ocsListGroups,
  ocsAddGroup,
} from './group';

import {
  NextcloudClientInterface,
  ConnectionOptions,
} from '../types';

import { OcsError } from '../errors';

const promisifiedGetActivities          = promisify(ocsGetActivities);

const promisifiedResendUserWelcomeEmail = promisify(ocsResendUserWelcomeEmail);
const promisifiedAddRemoveUserForGroup  = promisify(ocsAddRemoveUserForGroup);
const promisifiedGetUserSubAdmins       = promisify(ocsGetUserSubAdmins);
const promisifiedSetUserSubAdmin        = promisify(ocsSetUserSubAdmin);
const promisifiedSetUserEnabled         = promisify(ocsSetUserEnabled);
const promisifiedGetUserGroups          = promisify(ocsGetUserGroups);
const promisifiedDeleteUser             = promisify(ocsDeleteUser);
const promisifiedListUsers              = promisify(ocsListUsers);
const promisifiedEditUser               = promisify(ocsEditUser);
const promisifiedAddUser                = promisify(ocsAddUser);
const promisifiedGetUser                = promisify(ocsGetUser);

const promisifiedGetGroupSubAdmins      = promisify(ocsGetGroupSubAdmins);
const promisifiedGetGroupUsers          = promisify(ocsGetGroupUsers);
const promisifiedDeleteGroup            = promisify(ocsDeleteGroup);
const promisifiedListGroups             = promisify(ocsListGroups);
const promisifiedAddGroup               = promisify(ocsAddGroup);

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
    let reason;
    switch (error.code) {
      case 204:
        reason = 'The user has selected no activities to be listed in the stream';
        break;
      case 304:
        reason = 'ETag/If-None-Match are the same or the end of the activity list was reached';
        break;
      case 403:
        reason = 'The offset activity belongs to a different user or the user is not logged in';
        break;
      case 404:
        reason = 'The filter is unknown';
        break;
      default:
        reason = error.message;
        break;
    }

    activities = Promise.reject(new OcsError({
      reason,
      message: 'Unable to get activities for',
      identifier: fileId,
      statusCode: error.code
    }));
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
    return Promise.reject(new OcsError({
      message: 'Unable to find user',
      identifier: userId,
      reason: error.message
    }));
  }

  return user;
}

export async function setUserEnabled(
  connection: OcsConnection,
  userId: string,
  isEnabled: boolean
): Promise<boolean> {
  let success: Promise<boolean>;

  try {
    success = await promisifiedSetUserEnabled.call(connection, userId, isEnabled);
  } catch (error) {
    const errorObj = {
      message: `Unable to ${isEnabled ? 'enable' : 'disable'} user`,
      identifier: userId
    };

    if (error.code === 400 && error.meta && error.meta.statuscode) {
      let reason;
      switch (error.meta.statuscode) {
        case 101:
          reason = 'user does not exist';
          break;
        default:
          reason = error.meta.message;
          break;
      }

      Object.assign(errorObj, {
        reason,
        statusCode: error.meta.statuscode
      });
    } else {
      Object.assign(errorObj, {
        reason: error.message
      });
    }

    success = Promise.reject(new OcsError(errorObj));
  }

  return success;
}

export async function editUser(
  connection: OcsConnection,
  userId: string,
  field: OcsEditUserField,
  value: string
): Promise<boolean> {
  let userEdited: Promise<boolean>;

  try {
    userEdited = await promisifiedEditUser.call(connection, userId, field, value);
  } catch (error) {
    const errorObj = {
      message: 'Unable to edit user',
      identifier: userId
    };

    if (
      (error.code === 400 || error.code === 401) &&
      error.meta && error.meta.statuscode
    ) {
      let reason;
      switch (error.meta.statuscode) {
        case 101:
          reason = 'user not found';
          break;
        case 997:
          reason = 'possible reasons: Does it exist? Do you have the right permissions? Is the field valid?';
          break;
        case 102:
        case 103:
        default:
          reason = error.meta.message;
          break;
      }

      Object.assign(errorObj, {
        reason,
        statusCode: error.meta.statuscode
      });
    } else {
      Object.assign(errorObj, {
        reason: error.message
      });
    }

    userEdited = Promise.reject(new OcsError(errorObj));
  }

  return userEdited;
}

export async function getUserGroups(
  connection: OcsConnection,
  userId: string
): Promise<string[]> {
  let groups: Promise<string[]>;

  try {
    groups = await promisifiedGetUserGroups.call(connection, userId);
  } catch (error) {
    groups = Promise.reject(new OcsError({
      message: 'Unable to get groups for user',
      identifier: userId,
      reason: error.message
    }));
  }

  return groups;
}

export async function getUserSubAdmins(
  connection: OcsConnection,
  userId: string
): Promise<string[]> {
  let subAdmins: Promise<string[]>;

  try {
    subAdmins = await promisifiedGetUserSubAdmins.call(connection, userId);
  } catch (error) {
    const errorObj = {
      message: 'Unable to get sub-admins for user',
      identifier: userId
    };

    if (error.code === 400 && error.meta && error.meta.statuscode) {
      let reason;
      switch (error.meta.statuscode) {
        case 101:
          reason = 'user does not exist';
          break;
        case 102:
        default:
          reason = error.meta.message;
          break;
      }

      Object.assign(errorObj, {
        reason,
        statusCode: error.meta.statuscode
      });
    } else {
      Object.assign(errorObj, {
        reason: error.message
      });
    }

    subAdmins = Promise.reject(new OcsError(errorObj));
  }

  return subAdmins;
}

export async function resendUserWelcomeEmail(
  connection: OcsConnection,
  userId: string
): Promise<boolean> {
    let success: Promise<boolean>;

    try {
      success = await promisifiedResendUserWelcomeEmail.call(connection, userId);
    } catch (error) {
      const errorObj = {
        message: 'Unable to resend welcome email for user',
        identifier: userId
      };

      if (error.code === 400 && error.meta && error.meta.statuscode) {
        let reason;
        switch (error.meta.statuscode) {
          case 101:
            reason = 'email address not available';
            break;
          case 102:
            reason = 'sending email failed';
            break;
          default:
            reason = error.meta.message;
            break;
        }

        Object.assign(errorObj, {
          reason,
          statusCode: error.meta.statuscode
        });
      } else {
        Object.assign(errorObj, {
          reason: error.message
        });
      }

      success = Promise.reject(new OcsError(errorObj));
    }

    return success;
  }

export async function addRemoveUserForGroup(
  connection: OcsConnection,
  userId: string,
  groupId: string,
  toAdd: boolean
): Promise<boolean> {
  let userModifiedForGroup: Promise<boolean>;

  try {
    userModifiedForGroup = await promisifiedAddRemoveUserForGroup.call(connection, userId, groupId, toAdd);
  } catch (error) {
    const errorObj = {
      message: `Unable to ${toAdd ? 'add' : 'remove'} user '${userId}' ${toAdd ? 'to' : 'from'} group`,
      identifier: groupId
    };

    if (error.code === 400 && error.meta && error.meta.statuscode) {
      let reason = '';
      switch (error.meta.statuscode) {
        case 101:
          reason = 'no group specified';
          break;
        case 102:
          reason = 'group does not exist';
          break;
        case 103:
          reason = 'user does not exist';
          break;
        case 104:
          reason = 'insufficient privileges';
          break;
        case 105:
        default:
          reason = error.meta.message;
          break;
      }

      Object.assign(errorObj, {
        reason,
        statusCode: error.meta.statuscode
      });
    } else {
      Object.assign(errorObj, {
        reason: error.message,
        statusCode: error
      });
    }

    userModifiedForGroup = Promise.reject(new OcsError(errorObj));
  }

  return userModifiedForGroup;
}

export async function addRemoveUserSubAdminForGroup(
  connection: OcsConnection,
  userId: string,
  groupId: string,
  toAdd: boolean
): Promise<boolean> {
  let subAdminModifiedForGroup: Promise<boolean>;

  try {
    subAdminModifiedForGroup = await promisifiedSetUserSubAdmin.call(connection, userId, groupId, toAdd);
  } catch (error) {
    const errorObj = {
      message: `Unable to ${toAdd ? 'add' : 'remove'} user '${userId}' as sub-admin ${toAdd ? 'to' : 'from'} group`,
      identifier: groupId
    };

    if (error.code === 400 && error.meta && error.meta.statuscode) {
      let reason;
      switch (error.meta.statuscode) {
        case 101:
          if (toAdd) {
            reason = 'user does not exist';
          } else {
            reason = 'user or group does not exist';
          }
          break;
        case 102:
          if (toAdd) {
            reason = 'group does not exist';
          } else {
            reason = 'user is not a sub-admin of the group';
          }
          break;
        case 103:
        default:
          reason = error.meta.message;
          break;
      }

      Object.assign(errorObj, {
        reason,
        statusCode: error.meta.statuscode
      });
    } else {
      Object.assign(errorObj, {
        reason: error.message,
        statusCode: error
      });
    }


    subAdminModifiedForGroup = Promise.reject(new OcsError(errorObj));
  }

  return subAdminModifiedForGroup;
}

export async function listUsers(
  connection: OcsConnection,
  search?: string,
  limit?: number,
  offset?: number
): Promise<string[]> {
  let users: Promise<string[]> = null;

  try {
    users = await promisifiedListUsers.call(connection,
      search || '',
      Number.isInteger(limit)  ? limit  : -1,
      Number.isInteger(offset) ? offset : -1
    );
  } catch (error) {
    users = Promise.reject(new OcsError({
      message: 'Unable to list users',
      reason: error.message
    }));
  }

  return users;
}

export async function deleteUser(
  connection: OcsConnection,
  userId: string
): Promise<boolean> {
  let userDeleted: Promise<boolean>;

  try {
    userDeleted = await promisifiedDeleteUser.call(connection, userId);
  } catch (error) {
    const errorObj = {
      message: 'Unable to delete user',
      identifier: userId
    };

    if (error.code === 400 && error.meta && error.meta.statuscode) {
      let reason;
      switch (error.meta.statuscode) {
        case 101:
          reason = 'user does not exist';
          break;
        default:
          reason = error.meta.message;
          break;
      }

      Object.assign(errorObj, {
        reason,
        statusCode: error.meta.statuscode
      });
    } else {
      Object.assign(errorObj, {
        reason: error.message
      });
    }

    userDeleted = Promise.reject(new OcsError(errorObj));
  }

  return userDeleted;
}

export async function addUser(
  connection: OcsConnection,
  user: OcsNewUser
): Promise<boolean> {
  let userAdded: Promise<boolean>;

  try {
    userAdded = await promisifiedAddUser.call(connection, user);
  } catch (error) {
    const errorObj = {
      message: 'Unable to add user',
      identifier: (user && user.userid ? user.userid : ''),
    };

    if (error.code === 400 && error.meta && error.meta.statuscode) {
      let reason;
      switch (error.meta.statuscode) {
        case 102:
          reason = 'username already exists';
          break;
        case 103:
          reason = 'unknown error occurred whilst adding the user';
          break;
        case 104:
          reason = 'group does not exist';
          break;
        case 105:
          reason = 'insufficient privileges for group';
          break;
        case 106:
          reason = 'no group specified (required for sub-admins';
          break;
        case 108:
          reason = 'password and email empty. Must set password or an email';
          break;
        case 109:
          reason = 'invitation email cannot be send';
          break;
        case 101:
        case 107: // All errors that contain a hint - for example “Password is among the 1,000,000 most common ones. Please make it unique.”
        default:
          reason = error.meta.message;
          break;
      }

      Object.assign(errorObj, {
        reason,
        statusCode: error.meta.statuscode
      });
    } else {
      Object.assign(errorObj, {
        reason: error.message
      });
    }

    userAdded = Promise.reject(new OcsError(errorObj));
  }

  return userAdded;
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
    groups = Promise.reject(new OcsError({
      message: 'Unable to list groups',
      reason: error.message
    }));
  }

  return groups;
}

export async function addGroup(
  connection: OcsConnection,
  groupId: string
): Promise<boolean> {
  let groupAdded: Promise<boolean>;

  try {
    groupAdded = await promisifiedAddGroup.call(connection, groupId);
  } catch (error) {
    if (error.code === 400 && error.meta && error.meta.statuscode) {
      let message;
      switch (error.meta.statuscode) {
        case 102:
          message = 'group already exists';
          break;
        case 103:
          message = 'failed to add the group';
          break;
        case 101:
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
  groupId: string
): Promise<boolean> {
  let groupDeleted: Promise<boolean>;

  try {
    groupDeleted = await promisifiedDeleteGroup.call(connection, groupId);
  } catch (error) {
    if (error.code === 400 && error.meta && error.meta.statuscode) {
      let message;
      switch (error.meta.statuscode) {
        case 101:
          message = 'group does not exist';
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
  groupId: string
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
  groupId: string
): Promise<string[]> {
  let subAdmins: Promise<string[]>;

  try {
    subAdmins = await promisifiedGetGroupSubAdmins.call(connection, groupId);
  } catch (error) {
    if (error.code === 400 && error.meta && error.meta.statuscode) {
      let message;
      switch (error.meta.statuscode) {
        case 101:
          message = 'group does not exist';
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
