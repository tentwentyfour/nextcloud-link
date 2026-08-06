import { NotFoundError } from './errors';
import { createDetailProperty } from './webdav.utils';
export async function getCreatorByPath(path) {
    const self = this;
    let result = null;
    try {
        const folderProperties = await self.getPathInfo(path, {
            details: true,
            properties: [
                createDetailProperty('oc', 'fileid')
            ]
        });
        const fileId = folderProperties.data.props.fileid;
        result = await self.getCreatorByFileId(fileId);
    }
    catch {
        result = Promise.reject(new NotFoundError(`Unable to find the creator for '${path}'`));
    }
    return result;
}
export async function getCreatorByFileId(fileId) {
    const self = this;
    let result = null;
    try {
        const activities = await self.activities.get(fileId, 'asc', 1);
        const fileCreatedActivity = activities
            .find(activity => activity.type === 'file_created');
        result = fileCreatedActivity.user;
    }
    catch {
        result = Promise.reject(new NotFoundError(`Unable to find the creator for fileId '${fileId}'`));
    }
    return result;
}
