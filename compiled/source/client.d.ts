/// <reference types="node" />
import * as Webdav from 'webdav-client';
import * as Stream from 'stream';
import { configureWebdavConnection, checkConnectivity } from './webdav';
import { getCreatorByFileId, getCreatorByPath } from './common';
import { configureOcsConnection } from './ocs/ocs';
import { OcsEditUserField, OcsNewUser, OcsUser } from './ocs/types';
import { NextcloudClientProperties, NextcloudClientInterface, ConnectionOptions } from './types';
export declare class NextcloudClient extends NextcloudClientProperties implements NextcloudClientInterface {
    configureWebdavConnection: typeof configureWebdavConnection;
    configureOcsConnection: typeof configureOcsConnection;
    createFolderHierarchy: (sanePath: string) => Promise<void>;
    getFolderFileDetails: (sanePath: string, extraProperties?: Webdav.ConnectionReaddirProperty[]) => Promise<Webdav.ConnectionReaddirComplexResult[]>;
    getFolderProperties: (sanePath: string, extraProperties?: Webdav.ConnectionReaddirProperty[]) => Promise<Webdav.Properties>;
    checkConnectivity: typeof checkConnectivity;
    getWriteStream: (sanePath: string) => Promise<Webdav.Stream>;
    getReadStream: (sanePath: string) => Promise<Webdav.Stream>;
    touchFolder: (sanePath: string) => Promise<void>;
    pipeStream: (sanePath: string, stream: Stream) => Promise<void>;
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
        get: (fileId: string | number, sort?: "asc" | "desc", limit?: number, sinceActivityId?: number) => Promise<import("./types").OcsActivity[]>;
    };
    users: {
        removeSubAdminFromGroup: (userId: string, groupId: string) => Promise<boolean>;
        addSubAdminToGroup: (userId: string, groupId: string) => Promise<boolean>;
        resendWelcomeEmail: (userId: string) => Promise<boolean>;
        removeFromGroup: (userId: string, groupId: string) => Promise<boolean>;
        getSubAdmins: (userId: string) => Promise<string[]>;
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
    constructor(options: ConnectionOptions);
    as(username: string, password: string): NextcloudClient;
}
export default NextcloudClient;
