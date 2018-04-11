import * as Webdav from "webdav-client";

export class NextcloudClientData {
  webdavConnection: Webdav.Connection;
  url:              string;
}

export interface ConnectionOptions {
  url:       string;
  username?: string;
  password?: string;
}
