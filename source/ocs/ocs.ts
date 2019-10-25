import { rejectWithOcsError } from './helper';
import { ocsGetActivities }   from './activity';
import { OcsConnection }      from './ocs-connection';
import { promisify }          from 'util';

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
    activities = rejectWithOcsError(error, {
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

export async function getUser(
  connection: OcsConnection,
  userId: string
) : Promise<OcsUser> {
  let user: Promise<OcsUser>;

  try {
    user = await promisifiedGetUser.call(connection, userId);
  } catch (error) {
    user = rejectWithOcsError(error, {
      message: 'Unable to find user',
      identifier: userId,
      useMeta: false
    });
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
    success = rejectWithOcsError(error, {
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
    userEdited = rejectWithOcsError(error, {
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

export async function getUserGroups(
  connection: OcsConnection,
  userId: string
): Promise<string[]> {
  let groups: Promise<string[]>;

  try {
    groups = await promisifiedGetUserGroups.call(connection, userId);
  } catch (error) {
    groups = rejectWithOcsError(error, {
      message: 'Unable to get groups for user',
      identifier: userId,
      useMeta: false
    });
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
    subAdmins = rejectWithOcsError(error, {
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

export async function resendUserWelcomeEmail(
  connection: OcsConnection,
  userId: string
): Promise<boolean> {
    let success: Promise<boolean>;

    try {
      success = await promisifiedResendUserWelcomeEmail.call(connection, userId);
    } catch (error) {
      success = rejectWithOcsError(error, {
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
    userModifiedForGroup = rejectWithOcsError(error, {
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
    let customErrors = {};
    if (toAdd) {
      customErrors[101] = 'user does not exist';
      customErrors[102] = 'group does not exist';
    } else {
      customErrors[101] = 'user or group does not exist';
      customErrors[102] = 'user is not a sub-admin of the group';
    }

    subAdminModifiedForGroup = rejectWithOcsError(error, {
      customErrors,
      message: `Unable to ${toAdd ? 'add' : 'remove'} user '${userId}' as sub-admin ${toAdd ? 'to' : 'from'} group`,
      identifier: groupId,
      useMeta: true,
      expectedErrorCodes: [400],
    });
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
    users = rejectWithOcsError(error, {
      message: 'Unable to list users',
      useMeta: false
    });
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
    userDeleted = rejectWithOcsError(error, {
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

export async function addUser(
  connection: OcsConnection,
  user: OcsNewUser
): Promise<boolean> {
  let userAdded: Promise<boolean>;

  try {
    userAdded = await promisifiedAddUser.call(connection, user);
  } catch (error) {
    userAdded = rejectWithOcsError(error, {
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
    groups = rejectWithOcsError(error, {
      message: 'Unable to list groups',
      useMeta: false
    });
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
    groupAdded = rejectWithOcsError(error, {
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

export async function deleteGroup(
  connection: OcsConnection,
  groupId: string
): Promise<boolean> {
  let groupDeleted: Promise<boolean>;

  try {
    groupDeleted = await promisifiedDeleteGroup.call(connection, groupId);
  } catch (error) {
    groupDeleted = rejectWithOcsError(error, {
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

export async function getGroupUsers(
  connection: OcsConnection,
  groupId: string
): Promise<string[]> {
  let users: Promise<string[]>;

  try {
    users = await promisifiedGetGroupUsers.call(connection, groupId);
  } catch (error) {
    users = rejectWithOcsError(error, {
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

export async function getGroupSubAdmins(
  connection: OcsConnection,
  groupId: string
): Promise<string[]> {
  let subAdmins: Promise<string[]>;

  try {
    subAdmins = await promisifiedGetGroupSubAdmins.call(connection, groupId);
  } catch (error) {
    subAdmins = rejectWithOcsError(error, {
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
    shares = rejectWithOcsError(error, {
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

export async function getShare(
  connection: OcsConnection,
  shareId: number | string
): Promise<OcsShare> {
  let share: Promise<OcsShare>;

  try {
    share = await promisifiedGetShare.call(connection, shareId);
  } catch (error) {
    share = rejectWithOcsError(error, {
      message: 'Unable to get share',
      identifier: shareId,
      useMeta: true,
      expectedErrorCodes: [404]
    });
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
    shareDeleted = rejectWithOcsError(error, {
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

export async function addShare(
  connection: OcsConnection,
  path: string,
  shareType: OcsShareType,
  shareWith?: string,
  permissions?: OcsSharePermissions,
  password?: string,
  publicUpload?: boolean,
): Promise<OcsShare> {
  let addedShare: Promise<OcsShare>;

  try {
    addedShare = await promisifiedAddShare.call(connection,
      path,
      shareType,
      shareWith || '',
      (permissions !== undefined ? permissions : OcsSharePermissions.default),
      password || '',
      (publicUpload !== undefined ? publicUpload : false),
    );
  } catch (error) {
    addedShare = rejectWithOcsError(error, {
      message: 'Unable to add share',
      identifier: path,
      useMeta: true,
      expectedErrorCodes: [403, 404]
    });
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

    async publicUpload(isPublicUpload: boolean): Promise<OcsShare> {
      return await setFieldValue(connection, shareId, 'publicUpload', isPublicUpload);
    },

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
      editedShare = rejectWithOcsError(error, {
        message: `Unable to edit '${field}' of share`,
        identifier: shareId,
        useMeta: true,
        expectedErrorCodes: [400, 404]
      });
    }

    return editedShare;
  }
}
