import { dirname, join } from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const _dirname = dirname(fileURLToPath(import.meta.url));

const dockerConfig = fs.readFileSync(join(_dirname, '../docker-compose.yml')).toString();
const overrideFile = join(_dirname, '../local.json');
const overrideConfig = (fs.existsSync(overrideFile) ? JSON.parse(fs.readFileSync(overrideFile).toString()) : {});

const baseConfig = {
  address: '127.0.0.1', // `localhost` does not seem to work correctly after node 14
  port: dockerConfig.match(/(\d+):80/)![1],
  username: dockerConfig.match(/NEXTCLOUD_ADMIN_USER=(.*)/)![1],
  password: dockerConfig.match(/NEXTCLOUD_ADMIN_PASSWORD=(.*)/)![1],
  connectionOptions: null as unknown
};

let configuration = Object.assign({}, baseConfig, overrideConfig);
configuration.connectionOptions = {
  username: configuration.username,
  password: configuration.password,
  url: `http://${configuration.address}:${configuration.port}`
};

export default configuration;
