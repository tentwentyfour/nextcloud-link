import * as querystring from 'querystring';
import * as req from 'request';

import {
  OcsNewUser,
  OcsHttpError,
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

export function ocsListUsers(callback: (error: OcsHttpError, result?: string[]) => void): void {
  const self: OcsConnection = this;

  req({
    url: `${self.options.url}/${baseUrl}`,
    headers: self.getHeader()
  }, (error, response, body) => {
      self.request(error, response, body, (error: OcsHttpError, body?) => {
      let result: string[] = null;

      if (!error && body && body.data && body.data.users) {
        result = [];
        for (let i = 0; i < body.data.users.length; i++) {
          result.push(body.data.users[i]);
        }
      }

      callback(error, result);
    });
  });
}

export function ocsSetUserEnabled(isEnabled: boolean, callback: (error: OcsHttpError, result?: OcsUser) => void): void {
  throw new Error('Not implemented');
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

// FIXME:TODO:


export function ocsAddUser(user: OcsNewUser, callback: (error: OcsHttpError, result?: boolean) => void): void {
  const self: OcsConnection = this;

  // Basic validation
  if (!user) {
    callback({ code: 400, message: 'Must have a valid OcsNewUser object.' });
    return;
  }
  if (!user.userid) {
    callback({ code: 400, message: 'User must have an id.' });
    return;
  }
  if (!user.password && !user.email) {
    callback({ code: 400, message: 'User must have a valid email address if no password is supplied.'});
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

export function ocsEditUser(callback: (error: OcsHttpError, result?: OcsUser) => void): void {
  throw new Error('Not implemented');
}

export function ocsGetUserGroups(userId: string, callback: (error: OcsHttpError, result?: string[]) => void): void {
  const self: OcsConnection = this;

  // Basic validation
  if (!userId) {
    callback({ code: 400, message: 'no userId specified' });
    return;
  }

  req({
    url: `${self.options.url}/${baseUrl}/${userId}/groups`,
    headers: self.getHeader()
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let result: string[] = null;

      if (!error && body && body.data && body.data.groups) {
        result = [];
        for (let group of body.data.groups) {
          result.push(group);
        }
      }

      callback(error, result);
    });
  });
}

export function ocsAddRemoveUserForGroup(userId: string, groupId: string, toAdd: boolean, callback: (error: OcsHttpError, result?: boolean) => void): void {
  const self: OcsConnection = this;

  // Basic validation
  if (!userId) {
    callback({ code: 400, message: 'no userId specified' });
    return;
  }

  req({
    url: `${self.options.url}/${baseUrl}/${userId}/groups`,
    method: (toAdd ? 'POST' : 'DELETE'),
    headers: self.getHeader(true),
    body: JSON.stringify({
      groupid: groupId
    })
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

export function ocsSetUserSubAdmin(isSubAdmin: boolean, callback: (error: OcsHttpError, result?: OcsUser) => void): void {
  throw new Error('Not implemented');
}
