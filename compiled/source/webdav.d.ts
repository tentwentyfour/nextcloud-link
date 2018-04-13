/// <reference types="node" />
import { ConnectionOptions } from "./types";
import * as Stream from "stream";
export declare function configureWebdavConnection(options: ConnectionOptions): void;
export declare const getReadStream: (path: String) => Promise<Stream.Readable>;
export declare const removeFile: (path: String) => Promise<void>;
export declare const exists: (path: String) => Promise<boolean>;
export declare const put: (path: string, content: string) => Promise<void>;
export declare const getFiles: (path: String) => Promise<[string]>;
export declare function checkConnectivity(): Promise<boolean>;
export declare const getWriteStream: (path: String) => Promise<Stream.Writable>;
export declare const touchFolder: (path: String) => Promise<void>;
export declare const createFolderHierarchy: (path: String) => Promise<void>;
export declare const pipeStream: (path: String, stream: Stream.Readable) => Promise<void>;
