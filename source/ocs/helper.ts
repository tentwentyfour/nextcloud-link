import { OcsSharePermissions } from './types';
import { OcsError }            from '../errors';

export function rejectWithOcsError(
  message: string,
  reason: string,
  identifier?: string | number,
  statusCode?: string
) {
  const errorObj = {
    message,
    reason
  };

  assignDefined(errorObj, {
    identifier,
    statusCode
  });

  return Promise.reject(new OcsError(errorObj));
}

export function assignDefined(target, ...sources) {
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const val = source[key];
      if (val !== undefined) {
        target[key] = val;
      }
    }
  }
}

export function ocsSharePermissionsToText(permissions: OcsSharePermissions) : string {
  if (permissions === OcsSharePermissions.default) {
    return '';
  }
  if (permissions === OcsSharePermissions.all) {
    return 'all';
  }

  const result = [];
  Object.keys(OcsSharePermissions).forEach(key => {
    if (OcsSharePermissions[key] !== OcsSharePermissions.default && OcsSharePermissions[key] !== OcsSharePermissions.all) {
      if ((permissions & OcsSharePermissions[key]) === OcsSharePermissions[key]) {
        result.push(key);
      }
    }
  });

  return result.join('|');
}
