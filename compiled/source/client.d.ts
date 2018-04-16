/// <reference types="node" />
import * as Stream from "stream";
import { configureWebdavConnection, checkConnectivity } from "./webdav";
import { ConnectionOptions, NextcloudClientInterface, NextcloudClientProperties } from "./types";
declare class NextcloudClient extends NextcloudClientProperties implements NextcloudClientInterface {
    configureWebdavConnection: typeof configureWebdavConnection;
    createFolderHierarchy: (path: string) => Promise<void>;
    checkConnectivity: typeof checkConnectivity;
    getWriteStream: (path: string) => Promise<Stream.Writable>;
    getReadStream: (path: string) => Promise<Stream.Readable>;
    touchFolder: (path: string) => Promise<void>;
    pipeStream: (path: string, stream: Stream) => Promise<void>;
    getFiles: (path: string) => Promise<[string]>;
    rename: (from: string, to: string) => Promise<void>;
    remove: (path: string) => Promise<void>;
    exists: (path: string) => Promise<boolean>;
    put: (path: string, content: string) => Promise<void>;
    get: (path: string) => Promise<string>;
    constructor(options: ConnectionOptions);
}
export default NextcloudClient;
