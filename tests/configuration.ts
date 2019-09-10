import { ConnectionOptions } from '../source/types';
import { join }              from 'path';
import * as fs               from 'fs';

const config = fs.readFileSync(join(__dirname, '../docker-compose.yml')).toString();

const port     = config.match(/(\d+):80/)[1];
const username = config.match(/NEXTCLOUD_ADMIN_USER=(.*)/)[1];
const password = config.match(/NEXTCLOUD_ADMIN_PASSWORD=(.*)/)[1];

export default {
  username,
  password,

  url: `http://localhost:${port}`
} as ConnectionOptions;
