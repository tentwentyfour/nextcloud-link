"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var errors_1 = require("../errors");
function rejectWithOcsError(error, errorInfo) {
    var reason = error.message;
    var statusCode = '';
    if ((errorInfo.expectedErrorCodes === undefined ||
        errorInfo.expectedErrorCodes.includes(error.code)) && ((errorInfo.useMeta && error.meta && error.meta.statuscode) ||
        !errorInfo.useMeta)) {
        statusCode = (errorInfo.useMeta ? error.meta.statuscode : error.code);
        reason = (errorInfo.useMeta ? error.meta.message : reason);
        if (errorInfo.customErrors && errorInfo.customErrors.hasOwnProperty(statusCode)) {
            reason = errorInfo.customErrors[statusCode];
        }
    }
    return Promise.reject(new errors_1.OcsError({
        reason: reason,
        statusCode: statusCode,
        message: errorInfo.message,
        identifier: errorInfo.identifier
    }));
}
exports.rejectWithOcsError = rejectWithOcsError;
function assignDefined(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
        var source = sources_1[_a];
        for (var _b = 0, _c = Object.keys(source); _b < _c.length; _b++) {
            var key = _c[_b];
            var val = source[key];
            if (val !== undefined) {
                target[key] = val;
            }
        }
    }
}
exports.assignDefined = assignDefined;
function ocsSharePermissionsToText(permissions) {
    if (permissions === types_1.OcsSharePermissions.default) {
        return '';
    }
    if (permissions === types_1.OcsSharePermissions.all) {
        return 'all';
    }
    var result = [];
    Object.keys(types_1.OcsSharePermissions).forEach(function (key) {
        if (types_1.OcsSharePermissions[key] !== types_1.OcsSharePermissions.default && types_1.OcsSharePermissions[key] !== types_1.OcsSharePermissions.all) {
            if ((permissions & types_1.OcsSharePermissions[key]) === types_1.OcsSharePermissions[key]) {
                result.push(key);
            }
        }
    });
    return result.join('|');
}
exports.ocsSharePermissionsToText = ocsSharePermissionsToText;
//# sourceMappingURL=helper.js.map