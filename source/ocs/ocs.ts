import { OcsActivity, OcsUser } from './types';
import { ocsGetActivities }     from './activity';
import { OcsConnection }        from './ocs-connection';
import { ocsGetUser }           from './user';
import { promisify }            from 'util';

import {
  NextcloudClientInterface,
  ConnectionOptions,
} from '../types';

const promisifiedGetActivities = promisify(ocsGetActivities);
const promisifiedGetUser = promisify(ocsGetUser);

export function configureOcsConnection(options: ConnectionOptions): void {
  const self: NextcloudClientInterface = this;

  self.ocsConnection = new OcsConnection({
    url:           options.url,
    username:      options.username,
    password:      options.password
  });
}

export async function getActivities(
  connection: OcsConnection,
  fileId: number | string,
  sort?: 'asc' | 'desc',
  limit?: number,
  sinceActivityId?: number
) : Promise<OcsActivity[]> {
  let activities : OcsActivity[];
  try {
    activities = await promisifiedGetActivities.call(
      connection,
      (typeof fileId === 'string' ? parseInt(fileId, 10) : fileId),
      sort || 'desc',
      limit || -1,
      sinceActivityId || -1
    );
  } catch (error) {
    if (error.code !== 304) {
      throw error;
    }

    activities = null;
  }

  return activities;
}

export async function getUser(
  connection: OcsConnection,
  userId: string
) : Promise<OcsUser> {
  let user : OcsUser;

  try {
    user = await promisifiedGetUser.call(connection, userId);
  } catch (error) {
    if (error.code !== 404) {
      throw error;
    }

    user = null;
  }

  return user;
}
