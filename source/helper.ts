import { createDetailProperty } from './webdav.utils';

/**
 * Creates a ownCloud detail property for use with the various WebDAV methods.
 * @param element The element name (e.g. `fileid`)
 * @param nativeType **UNUSED** - The native type of the property (e.g. `number`)
 * @param defaultValue The default value to return if the property is not found
 * @returns A detail property
 *
 * @deprecated Use `createDetailProperty` instead
 */
export function createOwnCloudFileDetailProperty(element: string, nativeType?: boolean, defaultValue?: any) {
  return createDetailProperty('oc', element, defaultValue);
}

/**
 * Creates a NextCloud detail property for use with the various WebDAV methods.
 * @param element The element name (e.g. `fileid`)
 * @param nativeType **UNUSED** - The native type of the property (e.g. `number`)
 * @param defaultValue The default value to return if the property is not found
 * @returns A detail property
 *
 * @deprecated Use `createDetailProperty` instead
 */
export function createNextCloudFileDetailProperty(element: string, nativeType?: boolean, defaultValue?: any) {
  return createDetailProperty('nc', element, defaultValue);
}
