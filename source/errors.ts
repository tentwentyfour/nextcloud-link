import createErrorType from 'helpbox/source/create-error-type';

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
