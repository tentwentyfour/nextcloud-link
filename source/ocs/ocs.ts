import { promisify } from "util";

import * as Webdav   from "webdav-client";
import * as querystring from "querystring";
import * as req from "request";
import { OcsActivity } from "./types";
import { OcsConnection } from "./ocs-connection";

import {
  NextcloudClientInterface,
  ConnectionOptions,
  AsyncFunction,
} from "../types";


import {
  // Exception as NextcloudError,

  ForbiddenError,
  NotFoundError,
} from "../errors";

const sanitizePath = encodeURI;

export function configureOcsConnection(options: ConnectionOptions): void {
  const self: NextcloudClientInterface = this;

  self.ocsConnection = new OcsConnection({
    url:           options.url,
    username:      options.username,
    password:      options.password
  });
}

const promisifiedOcsGetActivities = promisify(ocsGetActivities);

async function rawGetActivities(objectId: number | string) : Promise<OcsActivity[]> {
  const self: NextcloudClientInterface = this;

  const activities : OcsActivity[] = await promisifiedOcsGetActivities.call(self.ocsConnection, objectId);

  return activities;
}

function ocsGetActivities(objectId: number | string, callback: (error: { code, message }, activities?: OcsActivity[]) => void) : void {
  const self: OcsConnection = this;

  const urlParams = querystring.stringify({
    format: 'json',
    object_type: 'files',
    object_id: objectId
  });

  req({
      url: `${self.options.url}/ocs/v2.php/apps/activity/api/v2/activity/filter?${urlParams}`,
      headers: self.getHeader()
    }, (error, response, body) => {
      self.request(error, response, body, (error: { code, message }, body?) => {
        let result: OcsActivity[] = [];

        if (!error && body && body.data && body.data.length > 0) {
          body.data.forEach(data => {
            result.push({
              activityId: parseInt(data.activity_id),
              app: data.app,
              type: data.type,
              user: data.user,
              subject: data.subject,
              subjectRich: data.subject_rich,
              message: data.message,
              messageRich: data.message_rich,
              objectType: data.object_type,
              objectId: data.objectId,
              objectName: data.object_name,
              objects: data.objects,
              link: data.link,
              icon: data.icon,
              datetime: data.datetime
            });
          });
        }

        callback(error, result);
      });
    });
}

export const getActivities = clientFunction(rawGetActivities);

function clientFunction<T extends AsyncFunction>(λ: T): T {
  return async function errorTranslator(...parameters) {
    // This assumes the first parameter will always be the path.
    const path = parameters[0];

    try {
      return await λ.apply(this, [sanitizePath(path)].concat(parameters.slice(1)));
    } catch (error) {
      let thrownError = error;

      if (error.statusCode) {
        if (error.statusCode === 404) {
          thrownError = new NotFoundError(path);
        } else if (error.statusCode === 403) {
          thrownError = new ForbiddenError(path);
        }
      }

      throw thrownError;
    }
  } as T;
}
