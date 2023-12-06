"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNextCloudFileDetailProperty = exports.createOwnCloudFileDetailProperty = void 0;
const webdav_utils_1 = require("./webdav.utils");
function createOwnCloudFileDetailProperty(element, nativeType, defaultValue) {
    return (0, webdav_utils_1.createDetailProperty)('oc', element, defaultValue);
}
exports.createOwnCloudFileDetailProperty = createOwnCloudFileDetailProperty;
function createNextCloudFileDetailProperty(element, nativeType, defaultValue) {
    return (0, webdav_utils_1.createDetailProperty)('nc', element, defaultValue);
}
exports.createNextCloudFileDetailProperty = createNextCloudFileDetailProperty;
