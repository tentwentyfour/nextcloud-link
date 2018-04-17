/// <reference types="node" />
import * as Stream from "stream";
import { ConnectionOptions } from "./types";
export declare function configureWebdavConnection(options: ConnectionOptions): void;
export declare function checkConnectivity(): Promise<boolean>;
export declare const createFolderHierarchy: (sanePath: string) => Promise<void>;
export declare const getWriteStream: (sanePath: string) => Promise<Stream.Writable>;
export declare const getReadStream: (sanePath: string) => Promise<Stream.Readable>;
export declare const touchFolder: (sanePath: string) => Promise<void>;
export declare const pipeStream: (sanePath: string, stream: Stream) => Promise<void>;
export declare const getFiles: (sanePath: string) => Promise<[string]>;
export declare const rename: (saneFrom: string, newName: string) => Promise<void>;
export declare const remove: (sanePath: string) => Promise<void>;
export declare const exists: (sanePath: string) => Promise<boolean>;
export declare const put: (sanePath: string, content: string) => Promise<void>;
export declare const get: (sanePath: string) => Promise<string>;
