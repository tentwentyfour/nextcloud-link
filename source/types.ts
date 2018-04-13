import * as Webdav from "webdav-client";
import * as Stream from "stream";

export type ReadStream  = Stream.Readable;
export type WriteStream = Stream.Writable;

export class NextcloudClientProperties {
  webdavConnection: Webdav.Connection;
  url:              string;
}

export interface NextcloudClientInterface extends NextcloudClientProperties {
  configureWebdavConnection(options: ConnectionOptions): void;
  pipeStream(path: String, stream: ReadStream):          Promise<void>;
  createFolderHierarchy(path: String):                   Promise<void>;
  put(path: String, content: String):                    Promise<void>;
  getWriteStream(path: String):                          Promise<WriteStream>;
  getReadStream(path: String):                           Promise<ReadStream>;
  touchFolder(path: String):                             Promise<void>;
  removeFile(path: String):                              Promise<void>;
  getFiles(path: String):                                Promise<[string]>;
  exists(path: String):                                  Promise<boolean>;
  checkConnectivity():                                   Promise<boolean>;
}

export interface ConnectionOptions {
  url:       string;
  username?: string;
  password?: string;
}
