import { ConnectionOptions } from '../types';
import { OcsHttpError } from './types';
export declare class OcsConnection {
    options: ConnectionOptions;
    constructor(url: string);
    constructor(options: ConnectionOptions);
    getHeader(withBody?: boolean): {
        'Content-Type': string;
        'OCS-APIRequest': boolean;
        Accept: string;
        Authorization: string;
    };
    isValidResponse(body: any): boolean;
    request(error: any, response: any, body: any, callback: (error: OcsHttpError, body?: any) => any): void;
}
export default OcsConnection;
