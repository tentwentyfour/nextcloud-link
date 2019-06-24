import {
  FileDetailProperty
} from './types';

export function createFileDetailProperty(namespace: string, namespaceShort: string, element: string, nativeType?: boolean, defaultValue?: any) : FileDetailProperty {
  return {
    'namespace': namespace,
    'namespaceShort': namespaceShort,
    'element': element,
    'default': defaultValue,
    'nativeType': nativeType
  };
}

export function createOwnCloudFileDetailProperty(element: string, nativeType?: boolean, defaultValue?: any) : FileDetailProperty {
  return createFileDetailProperty('http://owncloud.org/ns', 'oc', element, nativeType, defaultValue);
}

export function createNextCloudFileDetailProperty(element:string, nativeType?: boolean, defaultValue?: any) : FileDetailProperty {
  return createFileDetailProperty('http://nextcloud.org/ns', 'nc', element, nativeType, defaultValue);
}
