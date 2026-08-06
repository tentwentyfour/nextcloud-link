import type { WebDAVClient, WebDAVClientError } from "webdav";
import { NotFoundError, ForbiddenError, ConflictError, NextCloudServerException } from './errors';

// prefer whitelist over blacklist (or looping over all functions)
//   - less likely to break
const WRAPPED_FUNCTIONS: [
  /**
   * The name of the function to wrap.
   */
  string,

  /**
   * The position of the path argument in the original function.
   * @note -1 means no path argument.
   */
  number
][] = [
  ['copyFile', 0],
  ['createDirectory', 0],
  ['createReadStream', 0],
  ['createWriteStream', 0],
  ['customRequest', 0],
  ['deleteFile', 0],
  ['exists', 0],
  ['getDirectoryContents', 0],
  ['getFileContents', 0],
  ['getFileDownloadLink', 0],
  ['getFileUploadLink', 0],
  ['getHeaders', -1], // No path argument for getHeaders
  ['getQuota', -1], // No options argument for getQuota
  ['lock', 0],
  ['moveFile', 0],
  ['putFileContents', 0],
  ['setHeaders', -1], // No path argument for setHeaders
  ['stat', 0],
  ['unlock', 0]
];

/**
 * Wraps a WebDAVClient to throw NextcloudErrors instead of WebDAVClientError.
 * @param client The client to wrap.
 * @returns The wrapped client.
 *
 * @note This function mutates the client.
 * @note This function is idempotent.
 */
export function wrapClient(client: WebDAVClient): WebDAVClient {
  if (client['__ns_wrapped_client__']) {
    return client;
  }
  client['__ns_wrapped_client__'] = true;

  WRAPPED_FUNCTIONS.forEach(([fnName, pathPosition]) => {
    const originalFn = client[fnName];
    client[fnName] = async (...args: any[]) => {
      try {
        return await originalFn.apply(client, args);
      } catch (error) {
        throw wrapError(error, pathPosition === -1 ? undefined : args[pathPosition]);
      }
    };
  });

  return client;
}

/**
 * Wraps a WebDAVClientError to throw NextcloudErrors instead.
 * @param error The error to wrap.
 * @param path The path of the operation that failed.
 * @returns The wrapped error.
 */
export function wrapError(error: Error, path?: string): Error {
  if (!isWebDavError(error)) {
    return error;
  }

  if (isNotFoundError(error)) {
    return new NotFoundError(path)
  }

  if (isForbiddenError(error)) {
    return new ForbiddenError(path);
  }

  if (isConflictError(error)) {
    return new ConflictError(path);
  }

  return new NextCloudServerException('A WebDav Error occured', error);
}

/**
 * Checks if the given error is a WebDAVClientError.
 * @param error The error to check.
 * @returns True if the error is a WebDAVClientError.
 */
function isWebDavError(error: any): error is WebDAVClientError {
  return error && (error.response || error.status);
}

/**
 * Checks if the given error is a NotFoundError.
 * @param error The error to check.
 * @returns True if the error is a NotFoundError.
 */
function isNotFoundError(error: WebDAVClientError): error is { status: 404 } & WebDAVClientError {
  return error.status === 404;
}

/**
 * Checks if the given error is a ForbiddenError.
 * @param error The error to check.
 * @returns True if the error is a ForbiddenError.
 */
function isForbiddenError(error: WebDAVClientError): error is { status: 403 } & WebDAVClientError {
  return error.status === 403;
}

/**
 * Checks if the given error is a ConflictError.
 * @param error The error to check.
 * @returns True if the error is a ConflictError.
 */
function isConflictError(error: WebDAVClientError): error is { status: 409 } & WebDAVClientError {
  return error.status === 409;
}

