"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var fs = require("fs");
var dockerConfig = fs.readFileSync(path_1.join(__dirname, '../docker-compose.yml')).toString();
var overrideFile = path_1.join(__dirname, '../local.json');
var overrideConfig = (fs.existsSync(overrideFile) ? JSON.parse(fs.readFileSync(overrideFile).toString()) : {});
var baseConfig = {
    address: 'localhost',
    port: dockerConfig.match(/(\d+):80/)[1],
    username: dockerConfig.match(/NEXTCLOUD_ADMIN_USER=(.*)/)[1],
    password: dockerConfig.match(/NEXTCLOUD_ADMIN_PASSWORD=(.*)/)[1],
    connectionOptions: null
};
var configuration = Object.assign({}, baseConfig, overrideConfig);
configuration.connectionOptions = {
    username: configuration.username,
    password: configuration.password,
    url: "http://" + configuration.address + ":" + configuration.port
};
exports.default = configuration;
//# sourceMappingURL=configuration.js.map