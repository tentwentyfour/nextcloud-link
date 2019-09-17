import { createOwnCloudFileDetailProperty } from './helper';
import { NextcloudClientInterface }         from './types';
import { dirname, basename }                from 'path';
import * as assert                          from 'assert';

export async function getCreatorByPath(path: string) : Promise<string> {
  const self: NextcloudClientInterface = this;

  let result = null;

  const baseFolder       = dirname(path);
  const fileOrFolderName = basename(path);

  try {
    assert(await self.exists(baseFolder));
    const folderFileDetails = await self.getFolderFileDetails(
      baseFolder, [
        createOwnCloudFileDetailProperty('fileid', true),
      ]
    );

    const detail = folderFileDetails
    .find(detail => detail.name === fileOrFolderName);

    const fileId = detail.extraProperties['fileid'] as number;
    result = await self.getCreatorByFileId(fileId);
  } catch {
    result = Promise.reject(new Error('Unable to find the creator.'));
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
    result = Promise.reject(new Error('Unable to find the creator.'));
  }

  return result;
}
