/// <reference types="node" />
import * as Webdav from 'webdav-client';
import * as Stream from 'stream';
import { configureWebdavConnection, checkConnectivity } from './webdav';
import { getCreatorByFileId, getCreatorByPath } from './common';
import { configureOcsConnection } from './ocs/ocs';
import { OcsSharePermissions, OcsEditUserField, OcsShareType, OcsNewUser, OcsUser } from './ocs/types';
import { NextcloudClientProperties, NextcloudClientInterface, ConnectionOptions } from './types';
export declare class NextcloudClient extends NextcloudClientProperties implements NextcloudClientInterface {
    configureWebdavConnection: typeof configureWebdavConnection;
    configureOcsConnection: typeof configureOcsConnection;
    createFolderHierarchy: (sanePath: string) => Promise<void>;
    getFolderFileDetails: (sanePath: string, extraProperties?: Webdav.ConnectionReaddirProperty[]) => Promise<Webdav.ConnectionReaddirComplexResult[]>;
    getFolderProperties: (sanePath: string, extraProperties?: Webdav.ConnectionReaddirProperty[]) => Promise<Webdav.Properties>;
    checkConnectivity: typeof checkConnectivity;
    downloadToStream: (saneSourcePath: string, writeStream: Stream.Writable) => Promise<void>;
    uploadFromStream: (saneTargetPath: string, readStream: Stream.Readable) => Promise<void>;
    getWriteStream: (sanePath: string) => Promise<Webdav.Stream>;
    getReadStream: (sanePath: string) => Promise<Webdav.Stream>;
    touchFolder: (sanePath: string) => Promise<void>;
    pipeStream: (saneTargetPath: string, readStream: Stream.Readable) => Promise<void>;
    getFiles: (sanePath: string) => Promise<string[]>;
    rename: (saneFrom: string, newName: string) => Promise<void>;
    remove: (sanePath: string) => Promise<void>;
    exists: (sanePath: string) => Promise<boolean>;
    move: (saneFrom: string, toPath: string) => Promise<void>;
    put: (sanePath: string, content: Webdav.ContentType) => Promise<void>;
    get: (sanePath: string) => Promise<string>;
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
}
export default NextcloudClient;
