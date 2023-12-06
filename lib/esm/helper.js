import { createDetailProperty } from './webdav.utils';
export function createOwnCloudFileDetailProperty(element, nativeType, defaultValue) {
    return createDetailProperty('oc', element, defaultValue);
}
export function createNextCloudFileDetailProperty(element, nativeType, defaultValue) {
    return createDetailProperty('nc', element, defaultValue);
}
