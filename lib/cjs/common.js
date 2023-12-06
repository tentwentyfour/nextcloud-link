"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreatorByFileId = exports.getCreatorByPath = void 0;
const errors_1 = require("./errors");
const webdav_utils_1 = require("./webdav.utils");
async function getCreatorByPath(path) {
    const self = this;
    let result = null;
    try {
        const folderProperties = await self.getPathInfo(path, {
            details: true,
            properties: [
                (0, webdav_utils_1.createDetailProperty)('oc', 'fileid')
            ]
        });
        const fileId = folderProperties.data.props.fileid;
        result = await self.getCreatorByFileId(fileId);
    }
    catch {
        result = Promise.reject(new errors_1.NotFoundError(`Unable to find the creator for '${path}'`));
    }
    return result;
}
exports.getCreatorByPath = getCreatorByPath;
async function getCreatorByFileId(fileId) {
    const self = this;
    let result = null;
    try {
        const activities = await self.activities.get(fileId, 'asc', 1);
        const fileCreatedActivity = activities
            .find(activity => activity.type === 'file_created');
        result = fileCreatedActivity.user;
    }
    catch {
        result = Promise.reject(new errors_1.NotFoundError(`Unable to find the creator for fileId '${fileId}'`));
    }
    return result;
}
exports.getCreatorByFileId = getCreatorByFileId;
