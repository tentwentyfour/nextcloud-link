import * as Webdav from "webdav-client";
import * as last   from "lodash.last";

import {
  configureWebdavConnection,
  createFolderHierarchy,
  checkConnectivity,
  getWriteStream,
  getReadStream,
  touchFolder,
  pipeStream,
  removeFile,
  getFiles,
  exists,
  put
} from "./webdav";

import {
  ConnectionOptions,
  NextcloudClientInterface,
  NextcloudClientProperties
} from "./types";

export class NextcloudClient extends NextcloudClientProperties implements NextcloudClientInterface {
  configureWebdavConnection = configureWebdavConnection;
  createFolderHierarchy     = createFolderHierarchy;
  checkConnectivity         = checkConnectivity;
  getWriteStream            = getWriteStream;
  getReadStream             = getReadStream;
  touchFolder               = touchFolder;
  pipeStream                = pipeStream;
  removeFile                = removeFile;
  getFiles                  = getFiles;
  exists                    = exists;
  put                       = put;

  constructor(options: ConnectionOptions) {
    super();

    this.url = last(options.url) === "/" ? options.url.slice(0, -1) : options.url;

    this.configureWebdavConnection(options);
  }
}
