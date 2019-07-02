import { promisify } from 'util';

import { OcsActivity, OcsUser } from './types';
import { OcsConnection } from './ocs-connection';

import {
  NextcloudClientInterface,
  ConnectionOptions,
} from '../types';

import {
  clientFunction
} from '../helper';

import { ocsGetActivities } from './activity';
import { ocsGetUser } from './user';

const promisifiedOcsGetActivities = promisify(ocsGetActivities);
const promisifiedOcsGetUser = promisify(ocsGetUser);

export function configureOcsConnection(options: ConnectionOptions): void {
  const self: NextcloudClientInterface = this;

  self.ocsConnection = new OcsConnection({
    url:           options.url,
    username:      options.username,
    password:      options.password
  });
}

export const activitiesGet = clientFunction(rawActivitiesGet);
export const usersGetUser = clientFunction(rawUsersGetUser);

async function rawActivitiesGet(objectId: number | string) : Promise<OcsActivity[]> {
  const self: NextcloudClientInterface = this;

  const activities : OcsActivity[] = await promisifiedOcsGetActivities.call(self.ocsConnection, objectId);

  return activities;
}

async function rawUsersGetUser(userId: string) : Promise<OcsUser> {
  const self: NextcloudClientInterface = this;

  let user : OcsUser = null;

  try {
    user = await promisifiedOcsGetUser.call(self.ocsConnection, userId);
  } catch (error) {
    if (error.code !== 404) {
      throw error;
    }

    user = null;
  }

  return user;
}
