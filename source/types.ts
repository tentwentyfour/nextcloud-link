import * as Webdav from 'webdav-client';
import * as Stream from 'stream';
import { OcsActivity, OcsUser } from './ocs/types';
import { OcsConnection } from './ocs/ocs-connection';

export * from './ocs/types';

export type AsyncFunction       = (...parameters: any[]) => Promise<any>;
export type FileDetails         = Webdav.ConnectionReaddirComplexResult;
export type FileDetailProperty  = Webdav.ConnectionReaddirProperty;

export class NextcloudClientProperties {
  webdavConnection: Webdav.Connection;
  ocsConnection:    OcsConnection;
  username:         string;
  url:              string;
}

export interface NextcloudClientInterface extends NextcloudClientProperties {
  configureWebdavConnection(options: ConnectionOptions):                      void;
  configureOcsConnection(options: ConnectionOptions):                         void;
  pipeStream(path: string, stream: Stream.Readable):                          Promise<void>;
  rename(fromFullPath: string, toFileName: string):                           Promise<void>;
  move(fromFullPath: string, toFullPath: string):                             Promise<void>;
  as(username: string, password: string):                                     NextcloudClientInterface;
  createFolderHierarchy(path: string):                                        Promise<void>;
  put(path: string, content: Webdav.ContentType):                             Promise<void>;
  getFolderFileDetails(path: string, extraProperties?: FileDetailProperty[]): Promise<FileDetails[]>;
  getWriteStream(path: string):                                               Promise<Webdav.Stream>;
  getReadStream(path: string):                                                Promise<Webdav.Stream>;
  touchFolder(path: string):                                                  Promise<void>;
  getFiles(path: string):                                                     Promise<string[]>;
  remove(path: string):                                                       Promise<void>;
  exists(path: string):                                                       Promise<boolean>;
  checkConnectivity():                                                        Promise<boolean>;
  get(path: string):                                                          Promise<string | Buffer>;

  activitiesGet(objectId: number | string):                                   Promise<OcsActivity[]>;
  usersGetUser(userId: string):                                               Promise<OcsUser>;
}

export interface ConnectionOptions {
  url:       string;
  username?: string;
  password?: string;
}
