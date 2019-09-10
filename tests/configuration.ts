import * as fs               from 'fs';
import * as Path             from 'path';
import { ConnectionOptions } from '../source/types';

const config = fs.readFileSync(Path.join(__dirname, '../docker-compose.yml')).toString();

const port     = config.match(/(\d+):80/)[1];
const username = config.match(/NEXTCLOUD_ADMIN_USER=(.*)/)[1];
const password = config.match(/NEXTCLOUD_ADMIN_PASSWORD=(.*)/)[1];

export default {
  username,
  password,

  url: `http://localhost:${port}`
} as ConnectionOptions;
