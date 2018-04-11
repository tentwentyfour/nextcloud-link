import * as last                                  from "lodash.last";
import * as Webdav                                from "webdav-client";
import { ConnectionOptions, NextcloudClientData } from "./types";

import { WebdavClient, configureConnection } from "./webdav";

export class NextcloudClient extends NextcloudClientData implements WebdavClient {
  configureConnection = configureConnection;

  constructor(options: ConnectionOptions) {
    super();

    this.url = last(options.url) === "/" ? options.url.slice(0, -1) : options.url;

    this.configureConnection(options);
  }
}
