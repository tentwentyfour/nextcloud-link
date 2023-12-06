import { NotFoundError, ForbiddenError, ConflictError, NextCloudServerException } from './errors';
const WRAPPED_FUNCTIONS = [
    ['copyFile', 0],
    ['createDirectory', 0],
    ['createReadStream', 0],
    ['createWriteStream', 0],
    ['customRequest', 0],
    ['deleteFile', 0],
    ['exists', 0],
    ['getDirectoryContents', 0],
    ['getFileContents', 0],
    ['getFileDownloadLink', 0],
    ['getFileUploadLink', 0],
    ['getHeaders', -1],
    ['getQuota', -1],
    ['lock', 0],
    ['moveFile', 0],
    ['putFileContents', 0],
    ['setHeaders', -1],
    ['stat', 0],
    ['unlock', 0]
];
export function wrapClient(client) {
    if (client['__ns_wrapped_client__']) {
        return client;
    }
    client['__ns_wrapped_client__'] = true;
    WRAPPED_FUNCTIONS.forEach(([fnName, pathPosition]) => {
        const originalFn = client[fnName];
        client[fnName] = async (...args) => {
            try {
                return await originalFn.apply(client, args);
            }
            catch (error) {
                throw wrapError(error, pathPosition === -1 ? undefined : args[pathPosition]);
            }
        };
    });
    return client;
}
export function wrapError(error, path) {
    if (!isWebDavError(error)) {
        return error;
    }
    if (isNotFoundError(error)) {
        return new NotFoundError(path);
    }
    if (isForbiddenError(error)) {
        return new ForbiddenError(path);
    }
    if (isConflictError(error)) {
        return new ConflictError(path);
    }
    return new NextCloudServerException('A WebDav Error occured', error);
}
function isWebDavError(error) {
    return error && (error.response || error.status);
}
function isNotFoundError(error) {
    return error.status === 404;
}
function isForbiddenError(error) {
    return error.status === 403;
}
function isConflictError(error) {
    return error.status === 409;
}
