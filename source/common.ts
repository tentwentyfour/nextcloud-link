import { createOwnCloudFileDetailProperty } from './helper';
import { NextcloudClientInterface }         from './types';
import { dirname, basename }                from 'path';
import * as assert                          from 'assert';

export async function getFileOrFolderCreator(fullPath) : Promise<string> {
  const self: NextcloudClientInterface = this;

  let result = null;

  const baseFolder       = dirname(fullPath);
  const fileOrFolderName = basename(fullPath);

  try {
    assert(await self.exists(baseFolder));
    const folderFileDetails = await self.getFolderFileDetails(
      baseFolder, [
        createOwnCloudFileDetailProperty('fileid', true),
      ]
    );

    const detail = folderFileDetails
    .find(detail => detail.name === fileOrFolderName);

    const fileid = detail.extraProperties['fileid'] as number;
    result = await self.getObjectCreator(fileid);
  } catch {}

  return result || Promise.reject('Unable to find the creator.');
}

export async function getObjectCreator(objectId: number | string) : Promise<string> {
  const self: NextcloudClientInterface = this;

  let result = null;

  try {
    const activities = await self.activities.get(objectId, 'asc', 1);
    const fileCreatedActivity = activities
    .find(activity => activity.type === 'file_created');

    result = fileCreatedActivity.user;
  } catch {}

  return result || Promise.reject('Unable to find the creator.');
}
