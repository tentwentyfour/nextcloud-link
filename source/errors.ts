/**
 * Return a constructor for a new error type.
 *
 * @function createErrorType
 *
 * @param initialize {Function} A function that gets passed the constructed error and the passed message and
 *                              runs during the construction of new instances.
 * @param ErrorClass {Function} An error class you wish to subclass. Defaults to Error.
 * @param prototype  {Object}   Additional properties and methods for the new error type.
 *
 * @return {Function} The constructor for the new error type.
 */
function createErrorType(initialize = undefined, ErrorClass = undefined, prototype = undefined) {
  ErrorClass = ErrorClass || Error;

  let Constructor = function (message) {
      let error = Object.create(Constructor.prototype);

      error.message = message;
      error.stack   = (new Error).stack;

      if (initialize) {
          initialize(error, message);
      }

      return error;
  };

  Constructor.prototype = Object.assign(Object.create(ErrorClass.prototype), prototype);

  return Constructor;
}

export const Exception = createErrorType();

export const ForbiddenError = createErrorType(
  function forbiddenErrorConstructor(error, path) {
    error.message = `Access to ${path} was denied`;
  },

  Exception
);

export const NotFoundError = createErrorType(
  function notFoundErrorConstructor(error, path) {
    error.message = `${path} not found!`;
  },

  Exception
);

export const NotReadyError = createErrorType(
  function notReadyErrorConstructor(error) {
    error.message = 'The Nextcloud instance is initializing…';
  },

  Exception
);

export const IncorrectPathTypeError = createErrorType(
  function incorrectPathTypeErrorConstructor(error, {path, type}) {
    error.message = `The path '${path}' is not a ${type}`;
  },

  Exception
);

export const ConflictError = createErrorType(
  function conflictErrorConstructor(error, path) {
    error.message = `Conflict on ${path}`;
  },

  Exception
);

export const OcsError = createErrorType(
  function ocsErrorConstructor(error, { message, identifier, reason, statusCode }) {
    const id = (identifier ? ` '${identifier}'` : '');
    error.name = 'OcsError';
    error.message = `${message}${id}: ${reason}`;
    if (statusCode) {
      error.statusCode = statusCode;
    }
  },

  Exception
);
