import { rejectWithOcsError } from './helper';
import { ocsGetActivities }   from './activity';
import { OcsConnection }      from './ocs-connection';
import { promisify }          from 'util';
import { OcsError }           from '../errors';

import {
  OcsSharePermissions,
  OcsEditShareField,
  OcsEditUserField,
  OcsShareType,
  OcsActivity,
  OcsNewUser,
  OcsShare,
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
  ocsDeleteShare,
  ocsEditShare,
  ocsGetShares,
  ocsAddShare,
  ocsGetShare,
} from './share';

import {
  NextcloudClientInterface,
  ConnectionOptions,
} from '../types';

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

const promisifiedDeleteShare            = promisify(ocsDeleteShare);
const promisifiedEditShare              = promisify(ocsEditShare);
const promisifiedGetShares              = promisify(ocsGetShares);
const promisifiedGetShare               = promisify(ocsGetShare);
const promisifiedAddShare               = promisify(ocsAddShare);

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

    activities = rejectWithOcsError('Unable to get activities for', reason, fileId, error.code);
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
    user = rejectWithOcsError('Unable to find user', error.message, userId);
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
    let reason = error.message;
    let statusCode = '';

    if (error.code === 400 && error.meta && error.meta.statuscode) {
      switch (error.meta.statuscode) {
        case 101:
          reason = 'user does not exist';
          break;
        default:
          reason = error.meta.message;
          break;
      }

      statusCode = error.meta.statuscode;
    }

    success = rejectWithOcsError(`Unable to ${isEnabled ? 'enable' : 'disable'} user`, reason, userId, statusCode);
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
    let reason = error.message;
    let statusCode = '';

    if (
      (error.code === 400 || error.code === 401) &&
      error.meta && error.meta.statuscode
    ) {
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

      statusCode = error.meta.statuscode;
    }

    userEdited = rejectWithOcsError('Unable to edit user', reason, userId, statusCode);
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
    groups = rejectWithOcsError('Unable to get groups for user', error.message, userId);
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
    let reason = error.message;
    let statusCode = '';

    if (error.code === 400 && error.meta && error.meta.statuscode) {
      switch (error.meta.statuscode) {
        case 101:
          reason = 'user does not exist';
          break;
        case 102:
        default:
          reason = error.meta.message;
          break;
      }

      statusCode = error.meta.statuscode;
    }

    subAdmins = rejectWithOcsError('Unable to get sub-admins for user', reason, userId, statusCode);
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
      let reason = error.message;
      let statusCode = '';

      if (error.code === 400 && error.meta && error.meta.statuscode) {
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

        statusCode = error.meta.statuscode;
      }

      success = rejectWithOcsError('Unable to resend welcome email for user', reason, userId, statusCode);
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
    let reason = error.message;
    let statusCode = '';

    if (error.code === 400 && error.meta && error.meta.statuscode) {
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

      statusCode = error.meta.statuscode;
    }

    userModifiedForGroup = rejectWithOcsError(`Unable to ${toAdd ? 'add' : 'remove'} user '${userId}' ${toAdd ? 'to' : 'from'} group`, reason, groupId, statusCode);
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
    let reason = error.message;
    let statusCode = '';

    if (error.code === 400 && error.meta && error.meta.statuscode) {
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

      statusCode = error.meta.statuscode;
    }

    subAdminModifiedForGroup = rejectWithOcsError(`Unable to ${toAdd ? 'add' : 'remove'} user '${userId}' as sub-admin ${toAdd ? 'to' : 'from'} group`, reason, groupId, statusCode);
  }

  return subAdminModifiedForGroup;
}

export async function listUsers(
  connection: OcsConnection,
  search?: string,
  limit?: number,
  offset?: number
): Promise<string[]> {
  let users: Promise<string[]>;

  try {
    users = await promisifiedListUsers.call(connection,
      search || '',
      Number.isInteger(limit)  ? limit  : -1,
      Number.isInteger(offset) ? offset : -1
    );
  } catch (error) {
    users = rejectWithOcsError('Unable to list users', error.message);
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
    let reason = error.message;
    let statusCode = '';

    if (error.code === 400 && error.meta && error.meta.statuscode) {
      switch (error.meta.statuscode) {
        case 101:
          reason = 'user does not exist';
          break;
        default:
          reason = error.meta.message;
          break;
      }

      statusCode = error.meta.statuscode;
    }

    userDeleted = rejectWithOcsError('Unable to delete user', reason, userId, statusCode);
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
    let reason = error.message;
    let statusCode = '';

    if (error.code === 400 && error.meta && error.meta.statuscode) {
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

      statusCode = error.meta.statuscode;
    }

    userAdded = rejectWithOcsError('Unable to add user', reason, (user && user.userid ? user.userid : ''), statusCode);
  }

  return userAdded;
}

export async function listGroups(
  connection: OcsConnection,
  search?: string,
  limit?: number,
  offset?: number
): Promise<string[]> {
  let groups: Promise<string[]>;

  try {
    groups = await promisifiedListGroups.call(
      connection,
      search || '',
      Number.isInteger(limit)  ? limit  : -1,
      Number.isInteger(offset) ? offset : -1
    );
  } catch (error) {
    groups = rejectWithOcsError('Unable to list groups', error.message);
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
    let reason = error.message;
    let statusCode = '';

    if (error.code === 400 && error.meta && error.meta.statuscode) {
      switch (error.meta.statuscode) {
        case 102:
          reason = 'group already exists';
          break;
        case 103:
          reason = 'failed to add the group';
          break;
        case 101:
        default:
          reason = error.meta.message;
          break;
      }

      statusCode = error.meta.statuscode;
    }

    groupAdded = rejectWithOcsError('Unable to add group', reason, groupId, statusCode);
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
    let reason = error.message;
    let statusCode = '';

    if (error.code === 400 && error.meta && error.meta.statuscode) {
      switch (error.meta.statuscode) {
        case 101:
          reason = 'group does not exist';
          break;
        case 102:
          reason = 'failed to delete group';
          break;
        default:
          reason = error.meta.message;
          break;
      }

      statusCode = error.meta.statuscode;
    }

    groupDeleted = rejectWithOcsError('Unable to delete group', reason, groupId, statusCode);
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
    let reason = error.message;
    let statusCode = '';

    if (error.code === 404) {
      switch (error.code) {
        case 404:
          reason = 'the group could not be found';
          break;
        default:
          reason = error.message;
          break;
      }

      statusCode = error.meta.statuscode;
    }

    users = rejectWithOcsError('Unable to list users for group', reason, groupId, statusCode);
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
    let reason = error.message;
    let statusCode = '';

    if (error.code === 400 && error.meta && error.meta.statuscode) {
      switch (error.meta.statuscode) {
        case 101:
          reason = 'group does not exist';
          break;
        case 102:
        default:
          reason = error.meta.message;
          break;
      }

      statusCode = error.meta.statuscode;
    }

    subAdmins = rejectWithOcsError('Unable to list sub-admins for group', reason, groupId, statusCode);
  }

  return subAdmins;
}

export async function getShares(
  connection: OcsConnection,
  path?: string,
  includeReshares?: boolean,
  showForSubFiles?: boolean
): Promise<OcsShare[]> {
  let shares: Promise<OcsShare[]>;

  try {
    shares = await promisifiedGetShares.call(connection,
      path || '',
      (includeReshares !== undefined ? includeReshares : false),
      (showForSubFiles !== undefined ? showForSubFiles : false)
    );
  } catch (error) {
    let reason = error.message;
    let statusCode = '';

    if (
      (error.code === 400 || error.code === 404) &&
      error.meta && error.meta.statuscode
    ) {
      switch (error.meta.statuscode) {
        case 400:
          reason = 'unable to show sub-files as this is not a directory';
          break;
        case 404:
          reason = 'file/folder doesn\'t exist';
          break;
        default:
          reason = error.meta.message;
          break;
      }

      statusCode = error.meta.statuscode;
    }

    shares = rejectWithOcsError('Unable to get shares for', reason, path, statusCode);
  }

  return shares;
}

export async function getShare(
  connection: OcsConnection,
  shareId: number | string
): Promise<OcsShare> {
  let share: Promise<OcsShare>;

  try {
    share = await promisifiedGetShare.call(connection, shareId);
  } catch (error) {
    let reason = error.message;
    let statusCode = '';
    if (error.code === 404 && error.meta && error.meta.statuscode) {
      switch (error.meta.statuscode) {
        case 404:
        default:
          reason = error.meta.message;
          break;
      }

      statusCode = error.meta.statuscode;
    }

    share = rejectWithOcsError('Unable to get share', reason, shareId, statusCode);
  }

  return share;
}

export async function deleteShare(
  connection: OcsConnection,
  shareId: number | string
): Promise<boolean> {
  let shareDeleted: Promise<boolean>;

  try {
    shareDeleted = await promisifiedDeleteShare.call(connection, shareId);
  } catch (error) {
    let reason = error.message;
    let statusCode = '';
    if (error.code === 404 && error.meta && error.meta.statuscode) {
      switch (error.meta.statuscode) {
        case 404:
          reason = 'invalid shareId or the share doesn\'t exist';
          break;
        default:
          reason = error.meta.message;
          break;
      }

      statusCode = error.meta.statuscode;
    }

    shareDeleted = rejectWithOcsError('Unable to delete share', reason, shareId, statusCode);
  }

  return shareDeleted;
}

export async function addShare(
  connection: OcsConnection,
  path: string,
  shareType: OcsShareType,
  shareWith?: string,
  permissions?: OcsSharePermissions,
  password?: string,
  // publicUpload?: boolean,
): Promise<OcsShare> {
  let addedShare: Promise<OcsShare>;

  try {
    addedShare = await promisifiedAddShare.call(connection,
      path,
      shareType,
      shareWith || '',
      (permissions !== undefined ? permissions : OcsSharePermissions.default),
      password || '',
      // (publicUpload !== undefined ? publicUpload : false),
    );
  } catch (error) {
    let reason = error.message;
    let statusCode = '';
    if (
      (error.code === 403 || error.code === 404) &&
      error.meta && error.meta.statuscode
    ) {
      switch (error.meta.statuscode) {
        case 403:
        case 404:
        default:
          reason = error.meta.message;
          break;
      }

      statusCode = error.meta.statuscode;
    }

    addedShare = rejectWithOcsError('Unable to add share', reason, path, statusCode);
  }

  return addedShare;
}

export function editShare(
  connection: OcsConnection,
  shareId: number | string
) {
  return {
    async permissions(permissions: OcsSharePermissions): Promise<OcsShare> {
      return await setFieldValue(connection, shareId, 'permissions', permissions);
    },

    async password(password: string): Promise<OcsShare> {
      return await setFieldValue(connection, shareId, 'password', password);
    },

    // async publicUpload(isPublicUpload: boolean): Promise<OcsShare> {
    //   throw new Error('NOT IMPLEMENTED');
    // },

    async expireDate(expireDate: string): Promise<OcsShare> {
      return await setFieldValue(connection, shareId, 'expireDate', expireDate);
    },

    async note(note: string): Promise<OcsShare> {
      return await setFieldValue(connection, shareId, 'note', note);
    }
  };

  async function setFieldValue(
    connection: OcsConnection,
    shareId: number | string,
    field: OcsEditShareField,
    value: any
  ): Promise<OcsShare> {
    let editedShare: Promise<OcsShare>;

    try {
      editedShare = await promisifiedEditShare.call(connection, shareId, field, String(value));
    } catch (error) {
      let reason = error.message;
      let statusCode = '';

      if (
        (error.code === 400 || error.code === 404) &&
        error.meta && error.meta.statuscode
      ) {
        switch (error.meta.statuscode) {
          case 400:
          case 404:
          default:
            reason = error.meta.message;
            break;
        }
      }

      editedShare = rejectWithOcsError(`Unable to edit '${field}' of share`, reason, shareId, statusCode);
    }

    return editedShare;
  }
}
