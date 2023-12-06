/// <reference types="node" />
import { getCreatorByFileId, getCreatorByPath } from './common';
export * from './errors';
import { configureOcsConnection } from './ocs/ocs';
import { OcsShareType, OcsSharePermissions, type OcsEditUserField, type OcsNewUser, type OcsUser } from './ocs/types';
import { NextcloudClientProperties, type NextcloudClientInterface, type ConnectionOptions } from './types';
export { createOwnCloudFileDetailProperty, createNextCloudFileDetailProperty, } from './helper';
export { createDetailProperty } from './webdav.utils';
export declare class NextcloudClient extends NextcloudClientProperties implements NextcloudClientInterface {
    private options;
    configureOcsConnection: typeof configureOcsConnection;
    createFolderHierarchy: (path: string) => Promise<boolean>;
    getFolderFileDetails: (path: string, extraProperties?: import("./webdav.utils").DetailProperty<any, string>[]) => Promise<{
        isFile: boolean;
        isDirectory: boolean;
        lastModified: string;
        href: string;
        name: string;
        extraProperties: import("webdav").DAVResultResponseProps & Record<string, any>;
        filename: string;
        basename: string;
        lastmod: string;
        size: number;
        type: "file" | "directory";
        etag: string;
        mime?: string;
        props: import("webdav").DAVResultResponseProps & Record<string, any>;
    }[]>;
    getFolderProperties: (path: string, extraProperties?: import("./webdav.utils").DetailProperty<any, string>[]) => Promise<import("webdav").FileStat & Record<string, any>>;
    checkConnectivity: () => Promise<boolean>;
    downloadToStream: (path: string, writeStream: import("stream").Writable) => Promise<void>;
    uploadFromStream: (path: string, readStream: import("stream").Readable) => Promise<void>;
    getFilesDetailed: {
        <TProps extends import("./webdav.utils").DetailProperty<any, any>[]>(path: string, options: import("webdav").GetDirectoryContentsOptions & {
            details: true;
        } & import("./webdav").WebDAVMethodOptionProperties<TProps>): Promise<import("webdav").ResponseDataDetailed<(import("webdav").FileStat & {
            props: Record<import("./webdav.utils").ExtractDetailProperties<TProps>, any>;
        })[]>>;
        (path: string, options: import("webdav").GetDirectoryContentsOptions & {
            details?: false;
        }): Promise<import("webdav").FileStat[]>;
        (path: string, options?: import("webdav").GetDirectoryContentsOptions): Promise<import("webdav").FileStat[]>;
    };
    getWriteStream: (path: string, options?: import("webdav").CreateWriteStreamOptions & {
        onFinished: () => void;
    }) => Promise<import("stream").Writable>;
    getReadStream: (path: string, options?: import("webdav").CreateReadStreamOptions) => Promise<import("stream").Readable>;
    touchFolder: (path: string, options?: import("webdav").CreateDirectoryOptions) => Promise<boolean>;
    getPathInfo: {
        <TProps extends import("./webdav.utils").DetailProperty<any, any>[]>(path: string, options: import("webdav").StatOptions & {
            details: true;
        } & import("./webdav").WebDAVMethodOptionProperties<TProps>): Promise<import("webdav").ResponseDataDetailed<import("webdav").FileStat & {
            props: Record<import("./webdav.utils").ExtractDetailProperties<TProps>, any>;
        }>>;
        (path: string, options: import("webdav").StatOptions & {
            details?: false;
        }): Promise<import("webdav").FileStat>;
        (path: string, options?: import("webdav").StatOptions): Promise<import("webdav").FileStat>;
    };
    getFiles: (path: string) => Promise<string[]>;
    rename: (path: string, newName: string, options?: import("webdav").WebDAVMethodOptions) => Promise<void>;
    remove: (path: string, options?: import("webdav").WebDAVMethodOptions) => Promise<void>;
    exists: (path: string, options?: import("webdav").WebDAVMethodOptions) => Promise<boolean>;
    move: (path: string, destination: string, options?: import("webdav").WebDAVMethodOptions) => Promise<void>;
    put: (path: string, content: string | import("stream").Readable | import("webdav").BufferLike, options?: import("webdav").PutFileContentsOptions) => Promise<boolean>;
    get: (path: string, options?: import("webdav").GetFileContentsOptions) => Promise<string | import("webdav").BufferLike | import("webdav").ResponseDataDetailed<string | import("webdav").BufferLike>>;
    getCreatorByFileId: typeof getCreatorByFileId;
    getCreatorByPath: typeof getCreatorByPath;
    activities: {
        get: (fileId: number | string, sort?: 'asc' | 'desc', limit?: number, sinceActivityId?: number) => Promise<import("./types").OcsActivity[]>;
    };
    users: {
        removeSubAdminFromGroup: (userId: string, groupId: string) => Promise<boolean>;
        addSubAdminToGroup: (userId: string, groupId: string) => Promise<boolean>;
        resendWelcomeEmail: (userId: string) => Promise<boolean>;
        getSubAdminGroups: (userId: string) => Promise<string[]>;
        removeFromGroup: (userId: string, groupId: string) => Promise<boolean>;
        setEnabled: (userId: string, isEnabled: boolean) => Promise<boolean>;
        addToGroup: (userId: string, groupId: string) => Promise<boolean>;
        getGroups: (userId: string) => Promise<string[]>;
        delete: (userId: string) => Promise<boolean>;
        edit: (userId: string, field: OcsEditUserField, value: string) => Promise<boolean>;
        list: (search?: string, limit?: number, offset?: number) => Promise<string[]>;
        add: (user: OcsNewUser) => Promise<boolean>;
        get: (userId: string) => Promise<OcsUser>;
    };
    groups: {
        getSubAdmins: (groupId: string) => Promise<string[]>;
        getUsers: (groupId: string) => Promise<string[]>;
        delete: (groupId: string) => Promise<boolean>;
        list: (search?: string, limit?: number, offset?: number) => Promise<string[]>;
        add: (groupId: string) => Promise<boolean>;
    };
    shares: {
        delete: (shareId: number | string) => Promise<boolean>;
        edit: {
            permissions: (shareId: number | string, permissions: OcsSharePermissions) => Promise<import("./types").OcsShare>;
            password: (shareId: number | string, password: string) => Promise<import("./types").OcsShare>;
            publicUpload: (shareId: number | string, isPublicUpload: boolean) => Promise<import("./types").OcsShare>;
            expireDate: (shareId: number | string, expireDate: string) => Promise<import("./types").OcsShare>;
            note: (shareId: number | string, note: string) => Promise<import("./types").OcsShare>;
        };
        list: (path?: string, includeReshares?: boolean, showForSubFiles?: boolean) => Promise<import("./types").OcsShare[]>;
        add: (path: string, shareType: OcsShareType, shareWith?: string, permissions?: OcsSharePermissions, password?: string, publicUpload?: boolean) => Promise<import("./types").OcsShare>;
        get: (shareId: number | string) => Promise<import("./types").OcsShare>;
    };
    groupfolders: {
        getFolders: () => Promise<import("./types").OcsGroupfolder[]>;
        getFolder: (fid: number) => Promise<import("./types").OcsGroupfolder>;
        addFolder: (mountpoint: string) => Promise<number>;
        removeFolder: (fid: number) => Promise<boolean>;
        addGroup: (fid: number, gid: string) => Promise<boolean>;
        removeGroup: (fid: number, gid: string) => Promise<boolean>;
        setPermissions: (fid: number, gid: string, permissions: number) => Promise<boolean>;
        enableACL: (fid: number, enable: boolean) => Promise<boolean>;
        setManageACL: (fid: number, type: 'group' | 'user', id: string, manageACL: boolean) => Promise<boolean>;
        setQuota: (fid: number, quota: number) => Promise<boolean>;
        renameFolder: (fid: number, mountpoint: string) => Promise<boolean>;
    };
    constructor(options: ConnectionOptions);
    as(username: string, password: string): NextcloudClient;
    /**
     * Wrap a given prototype function to ensure such that the function called is
     * using the initialized WebDAV connection.
     * @param fn The function to wrap
     * @returns The wrapped function
     */
    private wrapWebDav;
}
export default NextcloudClient;
//# sourceMappingURL=client.d.ts.map