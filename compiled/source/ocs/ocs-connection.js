"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OcsConnection = /** @class */ (function () {
    function OcsConnection(options) {
        if (options.constructor === String) {
            // tslint:disable-next-line: no-parameter-reassignment
            options = { url: options };
        }
        this.options = options;
        if (this.options.url.lastIndexOf('/') === this.options.url.length - 1) {
            this.options.url = this.options.url.substring(0, this.options.url.length - 1);
        }
    }
    OcsConnection.prototype.getHeader = function (withBody) {
        var credentials = Buffer.from(this.options.username + ":" + (this.options.password ? this.options.password : '')).toString('base64');
        var header = {
            'Content-Type': (withBody ? 'application/json' : 'application/x-www-form-urlencoded'),
            'OCS-APIRequest': true,
            Accept: 'application/json',
            Authorization: "Basic " + credentials
        };
        return header;
    };
    OcsConnection.prototype.isValidResponse = function (body) {
        return (body && body.ocs && body.ocs.meta);
    };
    OcsConnection.prototype.request = function (error, response, body, callback) {
        if (error) {
            callback(error, null);
            return;
        }
        var jsonBody = JSON.parse(body || '{}');
        if (response.statusCode !== 200) {
            callback({
                code: response.statusCode,
                message: response.statusMessage,
                meta: (this.isValidResponse(jsonBody) ? jsonBody.ocs.meta : null)
            }, null);
            return;
        }
        if (this.isValidResponse(jsonBody)) {
            // Response is well-formed
            callback(null, jsonBody.ocs);
        }
        else {
            // Server said everything's fine but response is malformed
            callback({
                code: 500,
                message: 'The server said everything was fine but returned a malformed body. This should never happen.'
            });
        }
    };
    return OcsConnection;
}());
exports.OcsConnection = OcsConnection;
exports.default = OcsConnection;
module.exports = Object.assign(OcsConnection, { OcsConnection: OcsConnection, default: OcsConnection });
//# sourceMappingURL=ocs-connection.js.map