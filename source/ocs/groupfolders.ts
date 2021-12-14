import req from 'request';

import {
  OcsHttpError,
  OcsGroupfolder,
} from './types';

import { OcsConnection } from './ocs-connection';

const baseUrl = 'apps/groupfolders/folders';

// GET apps/groupfolders/folders: Returns a list of all configured groupfolders and their settings
export function ocsGetGroupfolders(
  callback: (error: OcsHttpError, result?: OcsGroupfolder[]) => void
): void {
  const self: OcsConnection = this;

  req({
    url: `${self.options.url}/${baseUrl}`,
    headers: self.getHeader(true),
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let result: OcsGroupfolder[] = null;

      if (!error && body && body.data) {
        result = [];

        Object.values(body.data).forEach(groupfolder => {
          result.push(parseOcsGroupfolder(groupfolder));
        });
      }

      callback(error, result);
    });
  });
}

// GET apps/groupfolders/folders/$folderId: Return a specific configured groupfolder and its settings
// returns groupfolder object if found, `null` otherwise
export function ocsGetGroupfolder(
  groupfolderId: number,
  callback: (error: OcsHttpError, result?: OcsGroupfolder) => void
): void {
  const self: OcsConnection = this;

  req({
    url: `${self.options.url}/${baseUrl}/${groupfolderId}`,
    headers: self.getHeader(true),
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let result: OcsGroupfolder = null;

      if (!error && body && body.data) {
        result = parseOcsGroupfolder(body.data);
      }

      callback(error, result);
    });
  });
}

// POST apps/groupfolders/folders: Create a new groupfolder
// `mountpoint`: The name for the new groupfolder
// returns new groupfolder id
export function ocsAddGroupfolder(
  mountpoint: string,
  callback: (error: OcsHttpError, result?: number) => void
): void {
  const self: OcsConnection = this;

  const body = {
    mountpoint,
  };

  req({
    url: `${self.options.url}/${baseUrl}`,
    method: 'POST',
    headers: self.getHeader(true), //! set `true` for POST requests
    body: JSON.stringify(body),
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let result: number = null;

      if (!error && body && body.data) {
        result = parseOcsGroupfolderId(body.data);
      }

      callback(error, result);
    });
  });
}

// DELETE apps/groupfolders/folders/$folderId: Delete a groupfolder
// returns `true` if successful (even if the groupfolder didn't exist)
export function ocsRemoveGroupfolder(
  groupfolderId: number,
  callback: (error: OcsHttpError, result?: boolean) => void
): void {
  const self: OcsConnection = this;

  req({
    url: `${self.options.url}/${baseUrl}/${groupfolderId}`,
    method: 'DELETE',
    headers: self.getHeader(),
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let groupfolderDeleted = false;

      if (!error && body) {
        groupfolderDeleted = true;
      }

      callback(error, groupfolderDeleted);
    });
  });
}

// POST apps/groupfolders/folders/$folderId/groups: Give a group access to a groupfolder
// `group`: The id of the group to be given access to the groupfolder
// returns `true` if successful (even if the group doesn't exist)
export function ocsAddGroupfolderGroup(
  groupfolderId: number,
  groupId: string,
  callback: (error: OcsHttpError, result?: boolean) => void
): void {
  const self: OcsConnection = this;

  const body = {
    group: groupId,
  };

  req({
    url: `${self.options.url}/${baseUrl}/${groupfolderId}/groups`,
    method: 'POST',
    headers: self.getHeader(true),
    body: JSON.stringify(body)
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let groupfolderGroupAdded = false;

      if (!error && body) {
        groupfolderGroupAdded = true;
      }

      callback(error, groupfolderGroupAdded);
    });
  });
}

// DELETE apps/groupfolders/folders/$folderId/groups/$groupId: Remove access from a group to a groupfolder
// returns `true` if successful (even if the groupfolder didn't exist)
export function ocsRemoveGroupfolderGroup(
  groupfolderId: number,
  groupId: string,
  callback: (error: OcsHttpError, result?: boolean) => void
): void {
  const self: OcsConnection = this;

  req({
    url: `${self.options.url}/${baseUrl}/${groupfolderId}/groups/${groupId}`,
    method: 'DELETE',
    headers: self.getHeader(),
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let groupfolderGroupRemoved = false;

      if (!error && body) {
        groupfolderGroupRemoved = true;
      }

      callback(error, groupfolderGroupRemoved);
    });
  });
}

// POST apps/groupfolders/folders/$folderId/groups/$groupId: Set the permissions a group has in a groupfolder
// `permissions` The new permissions for the group as bitmask of permissions constants
// e.g. write(6) === update(2) + create(4)
export function ocsSetGroupfolderPermissions(
  groupfolderId: number,
  groupId: string,
  permissions: number,
  callback: (error: OcsHttpError, result?: boolean) => void
): void {
  const self: OcsConnection = this;

  const body = {
    permissions,
  };

  req({
    url: `${self.options.url}/${baseUrl}/${groupfolderId}/groups/${groupId}`,
    method: 'POST',
    headers: self.getHeader(true),
    body: JSON.stringify(body),
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let groupfolderPermissionsSet = false;

      if (!error && body) {
        groupfolderPermissionsSet = true;
      }

      callback(error, groupfolderPermissionsSet);
    });
  });
}

// POST apps/groupfolders/folders/$folderId/acl: Enable/Disable groupfolder advanced permissions
// `acl`: `true` for enable, `false` for disable.
export function ocsEnableOrDisableGroupfolderACL(
  groupfolderId: number,
  enable: boolean,
  callback: (error: OcsHttpError, result?: boolean) => void
): void {
  const self: OcsConnection = this;

  const body = {
    acl: enable ? 1 : 0
  };

  req({
    url: `${self.options.url}/${baseUrl}/${groupfolderId}/acl`,
    method: 'POST',
    headers: self.getHeader(true),
    body: JSON.stringify(body),
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let groupfolderACLset = false;

      if (!error && body) {
        groupfolderACLset = true;
      }

      callback(error, groupfolderACLset);
    });
  });
}

// POST apps/groupfolders/folders/$folderId/manageACL: Grants/Removes a group or user the ability to manage a groupfolders' advanced permissions
// `mappingId`: the id of the group/user to be granted/removed access to/from the groupfolder
// `mappingType`: 'group' or 'user'
// `manageAcl`: true to grants ability to manage a groupfolders' advanced permissions, false to remove
export function ocsSetGroupfolderManageACL(
  groupfolderId: number,
  type: 'group' | 'user',
  id: string,
  manageACL: boolean,
  callback: (error: OcsHttpError, result?: boolean) => void
): void {
  const self: OcsConnection = this;

  const body = {
    mappingType: type,
    mappingId: id,
    manageAcl: manageACL ? 1 : 0
  };

  req({
    url: `${self.options.url}/${baseUrl}/${groupfolderId}/manageACL`,
    method: 'POST',
    headers: self.getHeader(true),
    body: JSON.stringify(body),
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let groupfolderPermissionsSet = false;

      if (!error && body) {
        groupfolderPermissionsSet = true;
      }

      callback(error, groupfolderPermissionsSet);
    });
  });
}

// POST apps/groupfolders/folders/$folderId/quota: Set the quota for a groupfolder in bytes
// `quota`: The new quota for the groupfolder in bytes, user -3 for unlimited
export function ocsSetGroupfolderQuota(
  groupfolderId: number,
  quota: number,
  callback: (error: OcsHttpError, result?: boolean) => void
): void {
  const self: OcsConnection = this;

  const body = {
    quota: Number.isNaN(quota) ? -3 : quota,
  };

  req({
    url: `${self.options.url}/${baseUrl}/${groupfolderId}/quota`,
    method: 'POST',
    headers: self.getHeader(true),
    body: JSON.stringify(body),
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let groupfolderQuotaSet = false;

      if (!error && body) {
        groupfolderQuotaSet = true;
      }

      callback(error, groupfolderQuotaSet);
    });
  });
}

// POST apps/groupfolders/folders/$folderId/mountpoint: Change the name of a groupfolder
// `mountpoint`: The new name for the groupfolder
export function ocsRenameGroupfolder(
  groupfolderId: number,
  mountpoint: string,
  callback: (error: OcsHttpError, result?: boolean) => void
): void {
  const self: OcsConnection = this;

  const body = {
    mountpoint,
  };

  req({
    url: `${self.options.url}/${baseUrl}/${groupfolderId}/mountpoint`,
    method: 'POST',
    headers: self.getHeader(true),
    body: JSON.stringify(body),
  }, (error, response, body) => {
    self.request(error, response, body, (error: OcsHttpError, body?) => {
      let groupfolderRenamed = false;

      if (!error && body) {
        groupfolderRenamed = true;
      }

      callback(error, groupfolderRenamed);
    });
  });
}

function parseOcsGroupfolder(groupfolder): OcsGroupfolder {
  return {
    id:         parseInt(groupfolder.id, 10),
    mountPoint: groupfolder.mount_point,
    groups:     groupfolder.groups,
    quota:      groupfolder.quota,
    size:       groupfolder.size,
    acl:        groupfolder.acl,
    manage:     groupfolder.manage,
  };
}

function parseOcsGroupfolderId(groupfolder): number {
  return parseInt(groupfolder.id, 10);
}
