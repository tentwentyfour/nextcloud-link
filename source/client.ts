import * as Webdav from "webdav-client";
import * as Stream from "stream";
import * as last   from "lodash.last";

import {
  configureWebdavConnection,
  createFolderHierarchy,
  checkConnectivity,
  getWriteStream,
  getReadStream,
  touchFolder,
  pipeStream,
  getFiles,
  rename,
  remove,
  exists,
  put,
  get
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
  getFiles                  = getFiles;
  rename                    = rename;
  remove                    = remove;
  exists                    = exists;
  put                       = put;
  get                       = get;

  constructor(options: ConnectionOptions) {
    super();

    this.url = last(options.url) === "/" ? options.url.slice(0, -1) : options.url;

    this.configureWebdavConnection(options);
  }
}
