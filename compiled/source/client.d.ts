/// <reference types="node" />
import * as Stream from "stream";
import { configureWebdavConnection } from "./webdav";
import { ConnectionOptions, NextcloudClientInterface, NextcloudClientProperties } from "./types";
export declare class NextcloudClient extends NextcloudClientProperties implements NextcloudClientInterface {
    configureWebdavConnection: typeof configureWebdavConnection;
    createFolderHierarchy: (path: String) => Promise<void>;
    checkConnectivity: () => Promise<boolean>;
    getWriteStream: (path: String) => Promise<Stream.Writable>;
    getReadStream: (path: String) => Promise<Stream.Readable>;
    touchFolder: (path: String) => Promise<void>;
    pipeStream: (path: String, stream: Stream.Readable) => Promise<void>;
    removeFile: (path: String) => Promise<void>;
    getFiles: (path: String) => Promise<[string]>;
    exists: (path: String) => Promise<boolean>;
    put: (path: string, content: string) => Promise<void>;
    constructor(options: ConnectionOptions);
}
