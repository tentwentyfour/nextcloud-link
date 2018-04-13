/// <reference types="node" />
import * as Stream from "stream";
import { ConnectionOptions } from "./types";
export declare function configureWebdavConnection(options: ConnectionOptions): void;
export declare const getReadStream: (path: string) => Promise<Stream.Readable>;
export declare const remove: (path: string) => Promise<void>;
export declare const exists: (path: string) => Promise<boolean>;
export declare const put: (path: string, content: string) => Promise<void>;
export declare const get: (path: string) => Promise<string>;
export declare const getFiles: (path: string) => Promise<[string]>;
export declare const rename: (from: string, to: string) => Promise<void>;
export declare function checkConnectivity(): Promise<boolean>;
export declare const getWriteStream: (path: string) => Promise<Stream.Writable>;
export declare const touchFolder: (path: string) => Promise<void>;
export declare const createFolderHierarchy: (path: string) => Promise<void>;
export declare const pipeStream: (path: string, stream: Stream) => Promise<void>;
