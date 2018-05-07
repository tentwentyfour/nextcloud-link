/// <reference types="node" />
import * as Stream from "stream";
import { configureWebdavConnection, checkConnectivity } from "./webdav";
import { ConnectionOptions, NextcloudClientInterface, NextcloudClientProperties } from "./types";
export declare class NextcloudClient extends NextcloudClientProperties implements NextcloudClientInterface {
    configureWebdavConnection: typeof configureWebdavConnection;
    createFolderHierarchy: (sanePath: string) => Promise<void>;
    checkConnectivity: typeof checkConnectivity;
    getWriteStream: (sanePath: string) => Promise<Stream.Writable>;
    getReadStream: (sanePath: string) => Promise<Stream.Readable>;
    touchFolder: (sanePath: string) => Promise<void>;
    pipeStream: (sanePath: string, stream: Stream) => Promise<void>;
    getFiles: (sanePath: string) => Promise<[string]>;
    rename: (saneFrom: string, newName: string) => Promise<void>;
    remove: (sanePath: string) => Promise<void>;
    exists: (sanePath: string) => Promise<boolean>;
    put: (sanePath: string, content: string) => Promise<void>;
    get: (sanePath: string) => Promise<string>;
    constructor(options: ConnectionOptions);
    as(username: string, password: string): NextcloudClient;
}
export default NextcloudClient;
