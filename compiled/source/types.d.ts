/// <reference types="node" />
import { OcsConnection } from './ocs/ocs-connection';
import * as Stream from 'stream';
import * as Webdav from 'webdav-client';
import { Tag } from './properties/tag';
export { Tag } from './properties/tag';
import { OcsSharePermissions, OcsEditUserField, OcsShareType, OcsActivity, OcsNewUser, OcsShare, OcsUser } from './ocs/types';
export * from './ocs/types';
export declare type AsyncFunction = (...parameters: any[]) => Promise<any>;
export declare type FileDetails = Webdav.ConnectionReaddirComplexResult;
export declare type FileDetailProperty = Webdav.ConnectionReaddirProperty;
export declare type FolderProperties = Webdav.Properties;
export declare class NextcloudClientProperties {
    webdavConnection: Webdav.Connection;
    ocsConnection: OcsConnection;
    username: string;
    url: string;
}
export interface NextcloudClientInterface extends NextcloudClientProperties {
    getFolderFileDetails(path: string, extraProperties?: FileDetailProperty[]): Promise<FileDetails[]>;
    getFolderProperties(path: string, extraProperties?: FileDetailProperty[]): Promise<FolderProperties>;
    configureWebdavConnection(options: ConnectionOptions): void;
    configureOcsConnection(options: ConnectionOptions): void;
    pipeStream(path: string, stream: Stream.Readable): Promise<void>;
    rename(fromFullPath: string, toFileName: string): Promise<void>;
    move(fromFullPath: string, toFullPath: string): Promise<void>;
    as(username: string, password: string): NextcloudClientInterface;
    createFolderHierarchy(path: string): Promise<void>;
    put(path: string, content: Webdav.ContentType): Promise<void>;
    getWriteStream(path: string): Promise<Webdav.Stream>;
    getReadStream(path: string): Promise<Webdav.Stream>;
    touchFolder(path: string): Promise<void>;
    getFiles(path: string): Promise<string[]>;
    remove(path: string): Promise<void>;
    exists(path: string): Promise<boolean>;
    checkConnectivity(): Promise<boolean>;
    get(path: string): Promise<string | Buffer>;
    getCreatorByFileId(fileId: number | string): Promise<string>;
    getCreatorByPath(path: string): Promise<string>;
    properties: {
        getFileId(path: string): Promise<string>;
        createTag(tagName: string): Promise<Tag>;
        addTag(fileID: number | string, tag: Tag): Promise<void>;
        removeTag(fileId: number | string, tag: Tag): Promise<void>;
        getTags(fileId: number | string, tag: Tag): Promise<Tag[]>;
    };
    activities: {
        get: (fileId: number | string, sort?: 'asc' | 'desc', limit?: number, sinceActivityId?: number) => Promise<OcsActivity[]>;
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
        delete: (shareId: string | number) => Promise<boolean>;
        edit: {
            permissions: (shareId: string | number, permissions: OcsSharePermissions) => Promise<OcsShare>;
            password: (shareId: string | number, password: string) => Promise<OcsShare>;
            publicUpload: (shareId: string | number, isPublicUpload: boolean) => Promise<OcsShare>;
            expireDate: (shareId: string | number, expireDate: string) => Promise<OcsShare>;
            note: (shareId: string | number, note: string) => Promise<OcsShare>;
        };
        list: (path?: string, includeReshares?: boolean, showForSubFiles?: boolean) => Promise<OcsShare[]>;
        add: (path: string, shareType: OcsShareType, shareWith?: string, permissions?: OcsSharePermissions, password?: string, publicUpload?: boolean) => Promise<OcsShare>;
        get: (shareId: string | number) => Promise<OcsShare>;
    };
}
export interface ConnectionOptions {
    url: string;
    username?: string;
    password?: string;
}
