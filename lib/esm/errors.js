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
export const NextCloudException = createErrorType(function nextCloudError(error, message, subError) {
    error.message = message;
    if (subError) {
        error.message += `: ${subError.message}`;
        error.stack = subError.stack;
    }
});
export const NextCloudServerException = createErrorType(function nextCloudError(error, message, subError) {
    error.message = message;
    if (subError) {
        error.message += `: ${subError.message}`;
        error.stack = subError.stack;
    }
}, NextCloudException);
export const NextCloudClientException = createErrorType(function nextCloudError(error, message, subError) {
    error.message = message;
    if (subError) {
        error.message += `: ${subError.message}`;
        error.stack = subError.stack;
    }
}, NextCloudException);
export const ForbiddenError = createErrorType(function forbiddenErrorConstructor(error, path) {
    error.message = `Access to ${path} was denied`;
}, NextCloudServerException);
export const NotFoundError = createErrorType(function notFoundErrorConstructor(error, path) {
    error.message = `${path} not found!`;
}, NextCloudServerException);
export const NotReadyError = createErrorType(function notReadyErrorConstructor(error) {
    error.message = 'The Nextcloud instance is initializing…';
}, NextCloudServerException);
export const UnreachableError = createErrorType(function notReadyErrorConstructor(error) {
    error.message = 'The Nextcloud instance is unreachable…';
}, NextCloudServerException);
export const IncorrectPathTypeError = createErrorType(function incorrectPathTypeErrorConstructor(error, options) {
    const { path, type } = options;
    error.message = `The path '${path}' is not a ${type}`;
}, NextCloudServerException);
export const ConflictError = createErrorType(function conflictErrorConstructor(error, path) {
    error.message = `Conflict on ${path}`;
}, NextCloudServerException);
export const OcsError = createErrorType(function ocsErrorConstructor(error, options) {
    const { message, identifier, reason, statusCode } = options;
    const id = (identifier ? ` '${identifier}'` : '');
    error.name = 'OcsError';
    error.message = `${message}${id}: ${reason}`;
    if (statusCode) {
        error.statusCode = statusCode;
    }
}, NextCloudServerException);
export const BadArgumentError = createErrorType(function badArgumentErrorConstructor(error, message) {
    error.message = message;
}, NextCloudClientException);
