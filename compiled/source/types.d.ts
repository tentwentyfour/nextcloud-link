/// <reference types="node" />
import { OcsConnection } from './ocs/ocs-connection';
import * as Stream from 'stream';
import * as Webdav from 'webdav-client';
import { OcsSharePermissions, OcsEditUserField, OcsGroupfolder, OcsShareType, OcsActivity, OcsNewUser, OcsShare, OcsUser } from './ocs/types';
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
    pipeStream(path: string, readStream: Stream.Readable): Promise<void>;
    uploadFromStream(targetPath: string, readStream: Stream.Readable): Promise<void>;
    downloadToStream(sourcePath: string, writeStream: Stream.Writable): Promise<void>;
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
    groupfolders: {
        getFolders: () => Promise<OcsGroupfolder[]>;
        getFolder: (fid: number) => Promise<OcsGroupfolder>;
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
}
export interface ConnectionOptions {
    url: string;
    username?: string;
    password?: string;
}
