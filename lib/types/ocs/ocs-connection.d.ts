import { AxiosResponse } from 'axios';
import type { ConnectionOptions } from '../types';
import { OcsHttpError } from './types';
export declare class OcsConnection {
    options: ConnectionOptions;
    constructor(url: string);
    constructor(options: ConnectionOptions);
    getHeader(withBody?: boolean): {
        'Content-Type': string;
        'OCS-APIRequest': string;
        Accept: string;
        Authorization: string;
    };
    isValidResponse(body: any): boolean;
    request(error: any, response: AxiosResponse, body: string | object | undefined, callback: (error: OcsHttpError, body?: any) => any): void;
}
export default OcsConnection;
//# sourceMappingURL=ocs-connection.d.ts.map