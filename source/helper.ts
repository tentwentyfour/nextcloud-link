import {
  FileDetailProperty,
  AsyncFunction,
} from './types';

import {
  // Exception as NextcloudError,

  ForbiddenError,
  NotFoundError,
} from './errors';

const sanitizePath = encodeURI;

export function createFileDetailProperty(namespace: string, namespaceShort: string, element: string, nativeType?: boolean, defaultValue?: any) : FileDetailProperty {
  return {
    namespace,
    namespaceShort,
    element,
    nativeType,
    default: defaultValue
  };
}

export function createOwnCloudFileDetailProperty(element: string, nativeType?: boolean, defaultValue?: any) : FileDetailProperty {
  return createFileDetailProperty('http://owncloud.org/ns', 'oc', element, nativeType, defaultValue);
}

export function createNextCloudFileDetailProperty(element:string, nativeType?: boolean, defaultValue?: any) : FileDetailProperty {
  return createFileDetailProperty('http://nextcloud.org/ns', 'nc', element, nativeType, defaultValue);
}

export function clientFunction<T extends AsyncFunction>(λ: T): T {
  return async function errorTranslator(...parameters) {
    // This assumes the first parameter will always be the path.
    const path = parameters[0];

    try {
      return await λ.apply(this, [sanitizePath(path)].concat(parameters.slice(1)));
    } catch (error) {
      let thrownError = error;

      if (error.statusCode) {
        if (error.statusCode === 404) {
          thrownError = new NotFoundError(path);
        } else if (error.statusCode === 403) {
          thrownError = new ForbiddenError(path);
        }
      }

      throw thrownError;
    }
  } as T;
}
