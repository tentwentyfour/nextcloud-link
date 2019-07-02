import * as querystring from 'querystring';
import * as req from 'request';

import { OcsUser } from './types';
import { OcsConnection } from './ocs-connection';

const baseUrl = 'ocs/v2.php/cloud/users';

export function ocsGetUser(userId: string, callback: (error: { code, message }, result?: OcsUser) => void) : void {
  const self: OcsConnection = this;

  const urlParams = querystring.stringify({
    format: 'json'
  });

  req({
      url: `${self.options.url}/${baseUrl}/${userId}?${urlParams}`,
      headers: self.getHeader()
    }, (error, response, body) => {
      self.request(error, response, body, (error: { code, message }, body?) => {
        let result: OcsUser = null;

        if (!error && body && body.data) {
          result = {
            id: body.data.id,
            enabled: body.data.enabled,
            lastLogin: body.data.lastLogin,
            email: body.data.email,
            displayname: body.data.displayname,
            phone: body.data.phone,
            address: body.data.address,
            website: body.data.website,
            twitter: body.data.twitter,
            groups: body.data.groups,
            language: body.data.language,
            locale: body.data.locale
          }
        }

        callback(error, result);
      });
    });
}
