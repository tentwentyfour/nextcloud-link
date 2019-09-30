import { createOwnCloudFileDetailProperty } from './helper';
import { NextcloudClientInterface }         from './types';

export async function getCreatorByPath(path: string) : Promise<string> {
  const self: NextcloudClientInterface = this;

  let result = null;

  try {
    const fileIdProp = createOwnCloudFileDetailProperty('fileid', true);
    const propName = `${fileIdProp.namespaceShort}:${fileIdProp.element}`;

    const folderProperties = await self.getFolderProperties(path, [fileIdProp]);

    const fileId = folderProperties[propName].content as string;
    result = await self.getCreatorByFileId(fileId);
  } catch {
    result = Promise.reject(new Error(`Unable to find the creator for '${path}'`));
  }

  return result;
}

export async function getCreatorByFileId(fileId: number | string) : Promise<string> {
  const self: NextcloudClientInterface = this;

  let result = null;

  try {
    const activities = await self.activities.get(fileId, 'asc', 1);
    const fileCreatedActivity = activities
    .find(activity => activity.type === 'file_created');

    result = fileCreatedActivity.user;
  } catch {
    result = Promise.reject(new Error(`Unable to find the creator for fileId '${fileId}'`));
  }

  return result;
}
