import { AxiosResponse } from 'axios';
import type { ConnectionOptions } from '../types';
import { OcsHttpError }      from './types';

export class OcsConnection {
  options : ConnectionOptions;

  constructor(url: string)
  constructor(options : ConnectionOptions)
  constructor(options : string | ConnectionOptions) {
    if (options.constructor === String) {
      // tslint:disable-next-line: no-parameter-reassignment
      options = { url: options as string };
    }
    this.options = options as ConnectionOptions;

    if (this.options.url.lastIndexOf('/') === this.options.url.length - 1) {
      this.options.url = this.options.url.substring(0, this.options.url.length - 1);
    }
  }

  getHeader(withBody?: boolean) {
    const credentials = Buffer.from(`${this.options.username}:${(this.options.password ? this.options.password : '')}`).toString('base64');
    const header = {
      'Content-Type': (withBody ? 'application/json' : 'application/x-www-form-urlencoded'),
      'OCS-APIRequest' : 'true',
      Accept: 'application/json',
      Authorization: `Basic ${credentials}`
    };

    return header;
  }

  isValidResponse(body) : boolean {
    return (body && body.ocs && body.ocs.meta);
  }

  request(error, response: AxiosResponse, body: string | object | undefined, callback: (error: OcsHttpError, body?: any) => any) {
    if (error) {
      callback(error, null);
      return;
    }

    let jsonBody;

    if (typeof body === 'object') {
      jsonBody = body;
    } else {
      try {
        jsonBody = JSON.parse(body || '{}');
      } catch {
        callback({
          code: 500,
          message: 'Unable to parse the response body as valid JSON.'
        });
      }
    }

    if (response.status !== 200) {
      callback({
        code: response.status,
        message: response.statusText,
        meta: (this.isValidResponse(jsonBody) ? jsonBody.ocs.meta : null)
      }, null);

      return;
    }

    if (this.isValidResponse(jsonBody)) {
      // Response is well-formed
      callback(null, jsonBody.ocs);
    } else {
      // Server said everything's fine but response is malformed
      callback({
        code: 500,
        message: 'The server said everything was fine but returned a malformed body. This should never happen.'}
      );
    }
  }
}

export default OcsConnection;

