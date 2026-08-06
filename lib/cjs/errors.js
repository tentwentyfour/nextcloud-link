"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadArgumentError = exports.OcsError = exports.ConflictError = exports.IncorrectPathTypeError = exports.UnreachableError = exports.NotReadyError = exports.NotFoundError = exports.ForbiddenError = exports.NextCloudClientException = exports.NextCloudServerException = exports.NextCloudException = void 0;
function createErrorType(initialize, ErrorClass, prototype) {
    ErrorClass ?? (ErrorClass = Error);
    let Constructor = function (...data) {
        let error = Object.create(Constructor.prototype);
        error.stack = (new Error).stack;
        if (initialize) {
            initialize(error, ...data);
        }
        return error;
    };
    Constructor.prototype = Object.create(ErrorClass.prototype);
    if (prototype) {
        Object.assign(Constructor.prototype, prototype);
    }
    return Constructor;
}
exports.NextCloudException = createErrorType(function nextCloudError(error, message, subError) {
    error.message = message;
    if (subError) {
        error.message += `: ${subError.message}`;
        error.stack = subError.stack;
    }
});
exports.NextCloudServerException = createErrorType(function nextCloudError(error, message, subError) {
    error.message = message;
    if (subError) {
        error.message += `: ${subError.message}`;
        error.stack = subError.stack;
    }
}, exports.NextCloudException);
exports.NextCloudClientException = createErrorType(function nextCloudError(error, message, subError) {
    error.message = message;
    if (subError) {
        error.message += `: ${subError.message}`;
        error.stack = subError.stack;
    }
}, exports.NextCloudException);
exports.ForbiddenError = createErrorType(function forbiddenErrorConstructor(error, path) {
    error.message = `Access to ${path} was denied`;
}, exports.NextCloudServerException);
exports.NotFoundError = createErrorType(function notFoundErrorConstructor(error, path) {
    error.message = `${path} not found!`;
}, exports.NextCloudServerException);
exports.NotReadyError = createErrorType(function notReadyErrorConstructor(error) {
    error.message = 'The Nextcloud instance is initializing…';
}, exports.NextCloudServerException);
exports.UnreachableError = createErrorType(function notReadyErrorConstructor(error) {
    error.message = 'The Nextcloud instance is unreachable…';
}, exports.NextCloudServerException);
exports.IncorrectPathTypeError = createErrorType(function incorrectPathTypeErrorConstructor(error, options) {
    const { path, type } = options;
    error.message = `The path '${path}' is not a ${type}`;
}, exports.NextCloudServerException);
exports.ConflictError = createErrorType(function conflictErrorConstructor(error, path) {
    error.message = `Conflict on ${path}`;
}, exports.NextCloudServerException);
exports.OcsError = createErrorType(function ocsErrorConstructor(error, options) {
    const { message, identifier, reason, statusCode } = options;
    const id = (identifier ? ` '${identifier}'` : '');
    error.name = 'OcsError';
    error.message = `${message}${id}: ${reason}`;
    if (statusCode) {
        error.statusCode = statusCode;
    }
}, exports.NextCloudServerException);
exports.BadArgumentError = createErrorType(function badArgumentErrorConstructor(error, message) {
    error.message = message;
}, exports.NextCloudClientException);
