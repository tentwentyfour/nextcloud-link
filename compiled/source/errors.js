"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var createErrorType = require("helpbox/source/create-error-type");
exports.Exception = createErrorType();
exports.ForbiddenError = createErrorType(function forbiddenErrorConstructor(error, path) {
    error.message = "Access to " + path + " was denied";
}, exports.Exception);
exports.NotFoundError = createErrorType(function notFoundErrorConstructor(error, path) {
    error.message = path + " not found!";
}, exports.Exception);
exports.NotReadyError = createErrorType(function notReadyErrorConstructor(error) {
    error.message = 'The Nextcloud instance is initializing…';
}, exports.Exception);
exports.OcsError = createErrorType(function ocsErrorConstructor(error, _a) {
    var message = _a.message, identifier = _a.identifier, reason = _a.reason, statusCode = _a.statusCode;
    var id = (identifier ? " '" + identifier + "'" : '');
    error.name = 'OcsError';
    error.message = "" + message + id + ": " + reason;
    if (statusCode) {
        error.statusCode = statusCode;
    }
}, exports.Exception);
//# sourceMappingURL=errors.js.map