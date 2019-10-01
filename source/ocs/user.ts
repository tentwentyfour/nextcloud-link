import * as querystring from 'querystring';
import * as req from 'request';

import {
  OcsEditUserField,
  OcsHttpError,
  OcsNewUser,
  OcsUser,
} from './types';
import { OcsConnection } from './ocs-connection';

const baseUrl = 'ocs/v2.php/cloud/users';

export function ocsGetUser(userId: string, callback: (error: OcsHttpError, result?: OcsUser) => void) : void {
  const self: OcsConnection = this;

  const urlParams = querystring.stringify({
    format: 'json'
  });

  req({
      url: `${self.options.url}/${baseUrl}/${userId}?${urlParams}`,
      headers: self.getHeader()
    }, (error, response, body) => {
      self.request(error, response, body, (error: OcsHttpError, body?) => {
        let result: OcsUser = null;

        if (!error && body && body.data) {
          result = {
            id: body.data.id,
            enabled: body.data.enabled,
            lastLogin: body.data.lastLogin,
            email: body.data.email,
            displayname: body.data.displayname,
            phone: body.data.phone,
            address: body.data.address,
            website: body.data.website,
            twitter: body.data.twitter,
            groups: body.data.groups,
            language: body.data.language,
            locale: body.data.locale
          };
        }

        callback(error, result);
      });
    });
}

export function ocsListUsers(
  search: string,
  limit: number,
  offset: number,
  callback: (error: OcsHttpError, result?: string[]) => void
): void {
  const self: OcsConnection = this;

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

  const urlParams = querystring.stringify(params);

  req({
    url: `${self.options.url}/${baseUrl}?${urlParams}`,
    headers: self.getHeader()
  }, (error, response, body) => {
      self.request(error, response, body, (error: OcsHttpError, body?) => {
      let users: string[] = null;

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

export function ocsSetUserEnabled(
  userId: string,
  isEnabled: boolean,
  callback: (error: OcsHttpError, result?: boolean) => void
): void {
  const self: OcsConnection = this;

  req({
    url: `${self.options.url}/${baseUrl}/${userId}/${isEnabled ? 'enable' : 'disable'}`,
    method: 'PUT',
    headers: self.getHeader()
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let success = false;
      if (!error && body) {
        success = true;
      }

      callback(error, success);
    });
  });
}

export function ocsDeleteUser(userId: string, callback: (error: OcsHttpError, result?: boolean) => void): void {
  const self: OcsConnection = this;

  req({
    url: `${self.options.url}/${baseUrl}/${userId}`,
    method: 'DELETE',
    headers: self.getHeader()
  }, (error, response, body) => {
      self.request(error, response, body, (error: OcsHttpError, body?) => {
      let userDeleted = false;
      if (!error && body) {
        userDeleted = true;
      }

      callback(error, userDeleted);
    });
  });
}

export function ocsAddUser(user: OcsNewUser, callback: (error: OcsHttpError, result?: boolean) => void): void {
  const self: OcsConnection = this;

  // Basic validation
  if (!user) {
    callback({ code: 0, message: 'must have a valid OcsNewUser object.' });
    return;
  }
  if (!user.userid) {
    callback({ code: 0, message: 'user must have an id.' });
    return;
  }

  req({
    url: `${self.options.url}/${baseUrl}`,
    method: 'POST',
    headers: self.getHeader(true),
    body: JSON.stringify(user)
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let userAdded = false;
      if (!error && body) {
        userAdded = true;
      }

      callback(error, userAdded);
    });
  });
}

export function ocsEditUser(
  userId: string,
  field: OcsEditUserField,
  value: string,
  callback: (error: OcsHttpError, result?: boolean) => void
): void {
  const self: OcsConnection = this;

  req({
    url: `${self.options.url}/${baseUrl}/${userId}`,
    method: 'PUT',
    headers: self.getHeader(true),
    body: JSON.stringify({ value, key: field })
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let userEdited = false;
      if (!error && body) {
        userEdited = true;
      }

      callback(error, userEdited);
    });
  });
}

export function ocsGetUserGroups(userId: string, callback: (error: OcsHttpError, result?: string[]) => void): void {
  const self: OcsConnection = this;

  // Basic validation
  if (!userId) {
    callback({ code: 0, message: 'no userId specified' });
    return;
  }

  req({
    url: `${self.options.url}/${baseUrl}/${userId}/groups`,
    headers: self.getHeader()
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let groups: string[] = null;

      if (!error && body && body.data && body.data.groups) {
        groups = [];
        body.data.groups.forEach(group => {
          groups.push(group);
        });
      }

      callback(error, groups);
    });
  });
}

export function ocsAddRemoveUserForGroup(
  userId: string,
  groupId: string,
  toAdd: boolean,
  callback: (error: OcsHttpError, result?: boolean) => void
): void {
  const self: OcsConnection = this;

  // Basic validation
  if (!userId) {
    callback({ code: 0, message: 'no userId specified' });
    return;
  }

  req({
    url: `${self.options.url}/${baseUrl}/${userId}/groups`,
    method: (toAdd ? 'POST' : 'DELETE'),
    headers: self.getHeader(true),
    body: JSON.stringify({ groupid: groupId })
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let userModifiedForGroup = false;
      if (!error && body) {
        userModifiedForGroup = true;
      }

      callback(error, userModifiedForGroup);
    });
  });
}

export function ocsSetUserSubAdmin(
  userId: string,
  groupId: string,
  isSubAdmin: boolean,
  callback: (error: OcsHttpError, result?: boolean) => void
): void {
  const self: OcsConnection = this;

  // Basic validation
  if (!userId) {
    callback({ code: 0, message: 'no userId specified' });
    return;
  }

  req({
    url: `${self.options.url}/${baseUrl}/${userId}/subadmins`,
    method: (isSubAdmin ? 'POST' : 'DELETE'),
    headers: self.getHeader(true),
    body: JSON.stringify({ groupid: groupId })
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let subAdminModifiedForGroup = false;
      if (!error && body) {
        subAdminModifiedForGroup = true;
      }

      callback(error, subAdminModifiedForGroup);
    });
  });
}

export function ocsGetUserSubAdmins(userId: string, callback: (error: OcsHttpError, result?: string[]) => void): void {
  const self: OcsConnection = this;

  // Basic validation
  if (!userId) {
    callback({ code: 0, message: 'no userId specified' });
    return;
  }

  req({
    url: `${self.options.url}/${baseUrl}/${userId}/subadmins`,
    headers: self.getHeader()
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let subAdmins: string[] = null;

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

export function ocsResendUserWelcomeEmail(userId: string, callback: (error: OcsHttpError, result?: boolean) => void): void {
  const self: OcsConnection = this;

  // Basic validation
  if (!userId) {
    callback({ code: 0, message: 'no userId specified' });
    return;
  }

  req({
    url: `${self.options.url}/${baseUrl}/${userId}/welcome`,
    method: 'POST',
    headers: self.getHeader()
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let success = false;
      if (!error && body) {
        success = true;
      }

      callback(error, success);
    });
  });
}
