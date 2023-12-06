import type { OcsEditUserField, OcsHttpError, OcsNewUser, OcsUser } from './types';
export declare function ocsGetUser(userId: string, callback: (error: OcsHttpError, result?: OcsUser) => void): void;
export declare function ocsListUsers(search: string, limit: number, offset: number, callback: (error: OcsHttpError, result?: string[]) => void): void;
export declare function ocsSetUserEnabled(userId: string, isEnabled: boolean, callback: (error: OcsHttpError, result?: boolean) => void): void;
export declare function ocsDeleteUser(userId: string, callback: (error: OcsHttpError, result?: boolean) => void): void;
export declare function ocsAddUser(user: OcsNewUser, callback: (error: OcsHttpError, result?: boolean) => void): void;
export declare function ocsEditUser(userId: string, field: OcsEditUserField, value: string, callback: (error: OcsHttpError, result?: boolean) => void): void;
export declare function ocsGetUserGroups(userId: string, callback: (error: OcsHttpError, result?: string[]) => void): void;
export declare function ocsAddRemoveUserForGroup(userId: string, groupId: string, toAdd: boolean, callback: (error: OcsHttpError, result?: boolean) => void): void;
export declare function ocsSetUserSubAdmin(userId: string, groupId: string, isSubAdmin: boolean, callback: (error: OcsHttpError, result?: boolean) => void): void;
export declare function ocsGetUserSubAdmins(userId: string, callback: (error: OcsHttpError, result?: string[]) => void): void;
export declare function ocsResendUserWelcomeEmail(userId: string, callback: (error: OcsHttpError, result?: boolean) => void): void;
//# sourceMappingURL=user.d.ts.map