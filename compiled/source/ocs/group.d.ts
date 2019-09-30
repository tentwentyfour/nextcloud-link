import { OcsHttpError } from './types';
export declare function ocsListGroups(search: string, limit: number, offset: number, callback: (error: OcsHttpError, result?: string[]) => void): void;
export declare function ocsAddGroup(groupId: string, callback: (error: OcsHttpError, result?: boolean) => void): void;
export declare function ocsDeleteGroup(groupId: string, callback: (error: OcsHttpError, result?: boolean) => void): void;
export declare function ocsGetGroupUsers(groupId: string, callback: (error: OcsHttpError, result?: string[]) => void): void;
export declare function ocsGetGroupSubAdmins(groupId: string, callback: (error: OcsHttpError, result?: string[]) => void): void;
