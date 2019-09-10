/// <reference types="node" />
import * as Webdav from 'webdav-client';
import * as Stream from 'stream';
import { configureWebdavConnection, checkConnectivity } from './webdav';
import { getFileOrFolderCreator, getObjectCreator } from './common';
import { configureOcsConnection } from './ocs/ocs';
import { OcsUser } from './ocs/types';
import { ConnectionOptions, NextcloudClientInterface, NextcloudClientProperties } from './types';
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
    getFileOrFolderCreator: typeof getFileOrFolderCreator;
    getObjectCreator: typeof getObjectCreator;
    activities: {
        get: (objectId: string | number, sort?: "asc" | "desc", limit?: number, sinceActivityId?: number) => Promise<import("./types").OcsActivity[]>;
    };
    users: {
        get: (userId: string) => Promise<OcsUser>;
    };
    constructor(options: ConnectionOptions);
    as(username: string, password: string): NextcloudClient;
}
export default NextcloudClient;
