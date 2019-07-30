/// <reference types="node" />
import { OcsActivity, OcsUser } from './ocs/types';
import { OcsConnection } from './ocs/ocs-connection';
import * as Stream from 'stream';
import * as Webdav from 'webdav-client';
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
    activities: {
        get: (objectId: number | string, sort?: 'asc' | 'desc', limit?: number, sinceActivityId?: number) => Promise<OcsActivity[]>;
    };
    users: {
        get: (userId: string) => Promise<OcsUser>;
    };
}
export interface ConnectionOptions {
    url: string;
    username?: string;
    password?: string;
}
