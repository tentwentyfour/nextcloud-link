import axios, {
  AxiosInstance,
  AxiosBasicCredentials,
  AxiosRequestConfig,
} from 'axios'
import { FileProps } from './fileProps'
import { Tag } from './tag'
import { MultiStatusResponse } from './multiStatusResponse'
import {ConnectionOptions, NextcloudClientInterface} from '../types';
import {OcsConnection} from '../ocs/ocs-connection';





export function configurePropertiesConnection(options: ConnectionOptions): void {
  const self: NextcloudClientInterface = this;

  self.ocsConnection = new OcsConnection({
    url:           options.url,
    username:      options.username,
    password:      options.password
  });
}
