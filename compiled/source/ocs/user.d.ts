import { OcsUser } from './types';
export declare function ocsGetUser(userId: string, callback: (error: {
    code: any;
    message: any;
}, result?: OcsUser) => void): void;
