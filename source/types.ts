import * as Webdav from "webdav-client";
import * as Stream from "stream";

export type AsyncFunction = (...parameters) => Promise<any>;

export class NextcloudClientProperties {
  webdavConnection: Webdav.Connection;
  url:              string;
}

export interface NextcloudClientInterface extends NextcloudClientProperties {
  configureWebdavConnection(options: ConnectionOptions): void;
  pipeStream(path: String, stream: Stream.Readable):     Promise<void>;
  createFolderHierarchy(path: String):                   Promise<void>;
  put(path: String, content: String):                    Promise<void>;
  getWriteStream(path: String):                          Promise<Stream.Writable>;
  getReadStream(path: String):                           Promise<Stream.Readable>;
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
