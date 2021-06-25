import * as querystring from 'querystring';
import req from 'request';

import {
  OcsHttpError,
} from './types';

import { OcsConnection } from './ocs-connection';

const baseUrl = 'ocs/v2.php/cloud/groups';

export function ocsListGroups(
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
      let result: string[] = null;

      if (!error && body && body.data && body.data.groups) {
        result = [];
        body.data.groups.forEach(group => {
          result.push(group);
        });
      }

      callback(error, result);
    });
  });
}

export function ocsAddGroup(groupId: string, callback: (error: OcsHttpError, result?: boolean) => void): void {
  const self: OcsConnection = this;

  req({
    url: `${self.options.url}/${baseUrl}`,
    method: 'POST',
    headers: self.getHeader(true),
    body: JSON.stringify({
      groupid: groupId
    })
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let groupAdded = false;
      if (!error && body) {
        groupAdded = true;
      }

      callback(error, groupAdded);
    });
  });
}

export function ocsDeleteGroup(groupId: string, callback: (error: OcsHttpError, result?: boolean) => void): void {
  const self: OcsConnection = this;

  req({
    url: `${self.options.url}/${baseUrl}/${groupId}`,
    method: 'DELETE',
    headers: self.getHeader(true)
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let groupDeleted = false;
      if (!error && body) {
        groupDeleted = true;
      }

      callback(error, groupDeleted);
    });
  });
}

export function ocsGetGroupUsers(groupId: string, callback: (error: OcsHttpError, result?: string[]) => void): void {
  const self: OcsConnection = this;

  req({
    url: `${self.options.url}/${baseUrl}/${groupId}`,
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

export function ocsGetGroupSubAdmins(groupId: string, callback: (error: OcsHttpError, result?: string[]) => void): void {
  const self: OcsConnection = this;

  req({
    url: `${self.options.url}/${baseUrl}/${groupId}/subadmins`,
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
