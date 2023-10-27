/**
 * Return a constructor for a new error type.
 *
 * @function createErrorType
 *
 * @param initialize A function that gets passed the constructed error and the passed message and
 *                              runs during the construction of new instances.
 * @param ErrorClass An error class you wish to subclass. Defaults to Error.
 * @param prototype Additional properties and methods for the new error type.
 *
 * @return The constructor for the new error type.
 */
function createErrorType<
  TInitialize extends (error: Error, ...args: any[]) => void,
  TErrorClass extends new (...args: any[]) => Error = ErrorConstructor,
  TPrototype extends object = object
>(
  initialize: TInitialize,
  ErrorClass?: TErrorClass,
  prototype?: TPrototype
) {
  ErrorClass ??= Error as any;

  let Constructor = function (...data: any[]) {
    let error = Object.create(Constructor.prototype);

    error.stack = (new Error).stack;

    if (initialize) {
      initialize(error, ...data);
    }

    return error;
  } ;

  Constructor.prototype = Object.create(ErrorClass!.prototype);

  if (prototype) {
    Object.assign(Constructor.prototype, prototype);
  }

  return Constructor as unknown as (
    TInitialize extends undefined
      ? (new (message: string) => Error)
      : (
        TInitialize extends (error: Error, ...args: infer TArgs) => void
          ? (new (...args: TArgs) => Error)
          : never
      )
  );
}

export const NextCloudException = createErrorType(
  function nextCloudError(error, message: string, subError?: Error) {
    error.message = message;
    if (subError) {
      error.message += `: ${subError.message}`;
      error.stack = subError.stack;
    }
  },
);

export const NextCloudServerException = createErrorType(
  function nextCloudError(error, message: string, subError?: Error) {
    error.message = message;
    if (subError) {
      error.message += `: ${subError.message}`;
      error.stack = subError.stack;
    }
  },

  NextCloudException
);

export const NextCloudClientException = createErrorType(
  function nextCloudError(error, message: string, subError?: Error) {
    error.message = message;
    if (subError) {
      error.message += `: ${subError.message}`;
      error.stack = subError.stack;
    }
  },

  NextCloudException
);

export const ForbiddenError = createErrorType(
  function forbiddenErrorConstructor(error, path: string) {
    error.message = `Access to ${path} was denied`;
  },

  NextCloudServerException
);

export const NotFoundError = createErrorType(
  function notFoundErrorConstructor(error, path: string) {
    error.message = `${path} not found!`;
  },

  NextCloudServerException
);

export const NotReadyError = createErrorType(
  function notReadyErrorConstructor(error) {
    error.message = 'The Nextcloud instance is initializing…';
  },

  NextCloudServerException
);

export const IncorrectPathTypeError = createErrorType(
  function incorrectPathTypeErrorConstructor(error, options: { path: string, type: string }) {
    const {path, type} = options;
    error.message = `The path '${path}' is not a ${type}`;
  },

  NextCloudServerException
);

export const ConflictError = createErrorType(
  function conflictErrorConstructor(error, path: string) {
    error.message = `Conflict on ${path}`;
  },

  NextCloudServerException
);

export const OcsError = createErrorType(
  function ocsErrorConstructor(error, options: { message: string, identifier?: string | number, reason: string, statusCode?: string | number }) {
    const {message, identifier, reason, statusCode} = options;

    const id = (identifier ? ` '${identifier}'` : '');
    error.name = 'OcsError';
    error.message = `${message}${id}: ${reason}`;
    if (statusCode) {
      (error as any).statusCode = statusCode;
    }
  },

  NextCloudServerException
);

export const BadArgumentError = createErrorType(
  function badArgumentErrorConstructor(error, message: string) {
    error.message = message;
  },

  NextCloudClientException
);
