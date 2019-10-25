import { OcsSharePermissions } from './types';
import { OcsError }            from '../errors';

export interface ErrorInfo {
  expectedErrorCodes?: number[];
  customErrors?:    { [key: number]: string };
  identifier?:     string | number;
  message:         string;
  useMeta:         boolean;
}

export function rejectWithOcsError(
  error,
  errorInfo: ErrorInfo
) : Promise<never> {
  let reason = error.message;
  let statusCode = '';
  if ((
      errorInfo.expectedErrorCodes === undefined ||
      errorInfo.expectedErrorCodes.includes(error.code)
    ) && (
      (errorInfo.useMeta && error.meta && error.meta.statuscode) ||
      !errorInfo.useMeta
  )) {
    statusCode = (errorInfo.useMeta ? error.meta.statuscode : error.code);
    reason = (errorInfo.useMeta ? error.meta.message : reason);

    if (errorInfo.customErrors && errorInfo.customErrors.hasOwnProperty(statusCode)) {
      reason = errorInfo.customErrors[statusCode];
    }
  }

  return Promise.reject(new OcsError({
    reason,
    statusCode,
    message: errorInfo.message,
    identifier: errorInfo.identifier
  }));
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
