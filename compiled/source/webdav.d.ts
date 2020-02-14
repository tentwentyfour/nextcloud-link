/// <reference types="node" />
import * as Webdav from 'webdav-client';
import * as Stream from 'stream';
import { FileDetailProperty, ConnectionOptions, FolderProperties, FileDetails } from './types';
declare function rawGetReadStream(sanePath: string): Promise<Webdav.Stream>;
declare function rawRemove(sanePath: string): Promise<void>;
declare function rawExists(sanePath: string): Promise<boolean>;
declare function rawPut(sanePath: string, content: Webdav.ContentType): Promise<void>;
declare function rawGet(sanePath: string): Promise<string>;
declare function rawGetFiles(sanePath: string): Promise<string[]>;
declare function rawGetFolderFileDetails(sanePath: string, extraProperties?: FileDetailProperty[]): Promise<FileDetails[]>;
declare function rawGetFolderProperties(sanePath: string, extraProperties?: FileDetailProperty[]): Promise<FolderProperties>;
declare function rawRename(saneFrom: string, newName: string): Promise<void>;
declare function rawMove(saneFrom: string, toPath: string): Promise<void>;
declare function rawGetWriteStream(sanePath: string): Promise<Webdav.Stream>;
declare function rawTouchFolder(sanePath: string): Promise<void>;
declare function rawCreateFolderHierarchy(sanePath: string): Promise<void>;
export declare function configureWebdavConnection(options: ConnectionOptions): void;
export declare function checkConnectivity(): Promise<boolean>;
declare function rawPipeStream(saneTargetPath: string, readStream: Stream.Readable): Promise<void>;
declare function rawUploadFromStream(saneTargetPath: string, readStream: Stream.Readable): Promise<void>;
declare function rawDownloadToStream(saneSourcePath: string, writeStream: Stream.Writable): Promise<void>;
export declare const createFolderHierarchy: typeof rawCreateFolderHierarchy;
export declare const getFolderFileDetails: typeof rawGetFolderFileDetails;
export declare const getFolderProperties: typeof rawGetFolderProperties;
export declare const getWriteStream: typeof rawGetWriteStream;
export declare const getReadStream: typeof rawGetReadStream;
export declare const touchFolder: typeof rawTouchFolder;
export declare const pipeStream: typeof rawPipeStream;
export declare const uploadFromStream: typeof rawUploadFromStream;
export declare const downloadToStream: typeof rawDownloadToStream;
export declare const getFiles: typeof rawGetFiles;
export declare const rename: typeof rawRename;
export declare const remove: typeof rawRemove;
export declare const move: typeof rawMove;
export declare const exists: typeof rawExists;
export declare const put: typeof rawPut;
export declare const get: typeof rawGet;
export {};
