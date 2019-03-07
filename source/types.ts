import * as Webdav from "webdav-client";
import * as Stream from "stream";

export type AsyncFunction = (...parameters) => Promise<any>;

export type ReadDirOptions = Webdav.ConnectionReaddirOptions;
export type ReadDirResult  = string | Webdav.ConnectionReaddirComplexResult;

export class NextcloudClientProperties {
  webdavConnection: Webdav.Connection;
  username:         string;
  url:              string;
}

export interface NextcloudClientInterface extends NextcloudClientProperties {
  configureWebdavConnection(options: ConnectionOptions): void;
  pipeStream(path: string, stream: Stream.Readable):     Promise<void>;
  getFiles(path: string, options?: ReadDirOptions):      Promise<[ReadDirResult]>;
  as(username: string, password: string):                NextcloudClientInterface;
  createFolderHierarchy(path: string):                   Promise<void>;
  put(path: string, content: string):                    Promise<void>;
  rename(from: string, to: string):                      Promise<void>;
  getWriteStream(path: string):                          Promise<Stream.Writable>;
  getReadStream(path: string):                           Promise<Stream.Readable>;
  getProperties(path: string):                           Promise<any>;
  touchFolder(path: string):                             Promise<void>;
  remove(path: string):                                  Promise<void>;
  exists(path: string):                                  Promise<boolean>;
  checkConnectivity():                                   Promise<boolean>;
  get(path: string):                                     Promise<string | Buffer>;
}

export interface ConnectionOptions {
  url:       string;
  username?: string;
  password?: string;
}
