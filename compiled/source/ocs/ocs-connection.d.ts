import { ConnectionOptions } from '../types';
export declare class OcsConnection {
    options: ConnectionOptions;
    constructor(url: string);
    constructor(options: ConnectionOptions);
    getHeader(): {
        'Content-Type': string;
        'OCS-APIRequest': boolean;
        Accept: string;
        Authorization: string;
    };
    isValidResponse(response: any): boolean;
    request(error: any, response: any, body: any, callback: any): void;
}
export default OcsConnection;
