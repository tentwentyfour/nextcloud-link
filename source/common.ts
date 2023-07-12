import type { NextcloudClientInterface }         from './types';
import { createDetailProperty } from './webdav.utils';

export async function getCreatorByPath(path: string) : Promise<string> {
  const self: NextcloudClientInterface = this;

  let result = null;

  try {
    const folderProperties = await self.getPathInfo(path, {
      details: true,
      properties: [
        createDetailProperty('oc', 'fileid')
      ]
    });

    const fileId = folderProperties.data.props.fileid as string;
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
