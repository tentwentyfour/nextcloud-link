import * as querystring from 'querystring';
import * as req from 'request';

import { OcsActivity } from './types';
import { OcsConnection } from './ocs-connection';

const baseUrl = 'ocs/v2.php/apps/activity/api/v2/activity';

export function ocsGetActivities(objectId: number | string, callback: (error: { code, message }, activities?: OcsActivity[]) => void) : void {
  const self: OcsConnection = this;

  const urlParams = querystring.stringify({
    format: 'json',
    object_type: 'files',
    object_id: objectId
  });

  req({
      url: `${self.options.url}/${baseUrl}/filter?${urlParams}`,
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
