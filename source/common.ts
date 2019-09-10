import { createOwnCloudFileDetailProperty } from './helper';
import { NextcloudClientInterface } from './types';
import * as Path from 'path';

export async function getFileOrFolderCreator(fullPath) : Promise<string> {
  const self: NextcloudClientInterface = this;

  let result = null;

  const baseFolder = Path.dirname(fullPath);
  const fileOrFolderName = Path.basename(fullPath);

  if (await self.exists(baseFolder)) {
    const folderFileDetails = await self.getFolderFileDetails(
      baseFolder, [
        createOwnCloudFileDetailProperty('fileid', true),
      ]
    );

    const detail = folderFileDetails
    .find(detail => detail.name === fileOrFolderName);

    if (detail) {
      const fileid = detail.extraProperties['fileid'] as number;

      result = await self.getObjectCreator(fileid);
    }
  }

  return result;
}

export async function getObjectCreator(objectId: number | string) : Promise<string> {
  const self: NextcloudClientInterface = this;

  let result = null;

  try {
    const activities = await self.activities.get(objectId, 'asc', 1);
    if (activities !== null) {
      const fileCreatedActivity = activities
      .find(activity => activity.type === 'file_created');

      if (fileCreatedActivity) {
        result = fileCreatedActivity.user;
      }
    }
  } catch (_) {}

  return result;
}
