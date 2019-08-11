import * as fs               from 'fs';
import * as path             from 'path';
import { ConnectionOptions } from '../source/types';

const dockerConfig = fs.readFileSync(path.join(__dirname, '../docker-compose.yml')).toString();
const overrideFile = path.join(__dirname, '../local.json');
const overrideConfig = (fs.existsSync(overrideFile) ? JSON.parse(fs.readFileSync(overrideFile).toString()) : {});

const baseConfig = {
  address: 'localhost',
  port: dockerConfig.match(/(\d+):80/)[1],
  username: dockerConfig.match(/NEXTCLOUD_ADMIN_USER=(.*)/)[1],
  password: dockerConfig.match(/NEXTCLOUD_ADMIN_PASSWORD=(.*)/)[1],
  connectionOptions: null as ConnectionOptions
};

let configuration = Object.assign({}, baseConfig, overrideConfig);
configuration.connectionOptions = {
  username: configuration.username,
  password: configuration.password,
  url: `http://${configuration.address}:${configuration.port}`
} as ConnectionOptions;

export default configuration;
