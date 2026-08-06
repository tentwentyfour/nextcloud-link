"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promisify = exports.ocsSharePermissionsToText = exports.assignDefined = exports.rejectWithOcsError = void 0;
const types_1 = require("./types");
const errors_1 = require("../errors");
function rejectWithOcsError(error, errorInfo) {
    let reason = error.message;
    let statusCode = '';
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
        reason,
        statusCode,
        message: errorInfo.message,
        identifier: errorInfo.identifier
    }));
}
exports.rejectWithOcsError = rejectWithOcsError;
function assignDefined(target, ...sources) {
    for (const source of sources) {
        for (const key of Object.keys(source)) {
            const val = source[key];
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
    const result = [];
    Object.keys(types_1.OcsSharePermissions).forEach(key => {
        if (types_1.OcsSharePermissions[key] !== types_1.OcsSharePermissions.default && types_1.OcsSharePermissions[key] !== types_1.OcsSharePermissions.all) {
            if ((permissions & types_1.OcsSharePermissions[key]) === types_1.OcsSharePermissions[key]) {
                result.push(key);
            }
        }
    });
    return result.join('|');
}
exports.ocsSharePermissionsToText = ocsSharePermissionsToText;
function promisify(fn) {
    return function (...args) {
        const self = this;
        return new Promise((resolve, reject) => {
            fn.call(self, ...args, function (err, res) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(res);
                }
            });
        });
    };
}
exports.promisify = promisify;
