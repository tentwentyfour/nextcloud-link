import type { WebDAVClient } from "webdav";
/**
 * Wraps a WebDAVClient to throw NextcloudErrors instead of WebDAVClientError.
 * @param client The client to wrap.
 * @returns The wrapped client.
 *
 * @note This function mutates the client.
 * @note This function is idempotent.
 */
export declare function wrapClient(client: WebDAVClient): WebDAVClient;
/**
 * Wraps a WebDAVClientError to throw NextcloudErrors instead.
 * @param error The error to wrap.
 * @param path The path of the operation that failed.
 * @returns The wrapped error.
 */
export declare function wrapError(error: Error, path?: string): Error;
//# sourceMappingURL=webdav.wrapper.d.ts.map