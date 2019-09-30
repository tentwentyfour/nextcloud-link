import { OcsNewUser, OcsHttpError, OcsUser } from './types';
export declare function ocsGetUser(userId: string, callback: (error: {
    code: any;
    message: any;
}, result?: OcsUser) => void): void;
export declare function ocsListUsers(callback: (error: {
    code: any;
    message: any;
}, result?: string[]) => void): void;
export declare function ocsSetUserEnabled(isEnabled: boolean, callback: (error: {
    code: any;
    message: any;
}, result?: OcsUser) => void): void;
export declare function ocsDeleteUser(userId: string, callback: (error: {
    code: any;
    message: any;
}, result?: boolean) => void): void;
export declare function ocsAddUser(user: OcsNewUser, callback: (error: OcsHttpError, result?: boolean) => void): void;
export declare function ocsEditUser(callback: (error: {
    code: any;
    message: any;
}, result?: OcsUser) => void): void;
export declare function ocsGetUserGroups(callback: (error: {
    code: any;
    message: any;
}, result?: OcsUser) => void): void;
export declare function ocsAddUserToGroup(userId: string, groupId: string, callback: (error: {
    code: any;
    message: any;
}, result?: OcsUser) => void): void;
export declare function ocsRemoveUserFromGroup(callback: (error: {
    code: any;
    message: any;
}, result?: OcsUser) => void): void;
export declare function ocsSetUserSubAdmin(isSubAdmin: boolean, callback: (error: {
    code: any;
    message: any;
}, result?: OcsUser) => void): void;
