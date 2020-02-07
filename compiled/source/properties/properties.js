"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ocs_connection_1 = require("../ocs/ocs-connection");
function configurePropertiesConnection(options) {
    var self = this;
    self.ocsConnection = new ocs_connection_1.OcsConnection({
        url: options.url,
        username: options.username,
        password: options.password
    });
}
exports.configurePropertiesConnection = configurePropertiesConnection;
//# sourceMappingURL=properties.js.map