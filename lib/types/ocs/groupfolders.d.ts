import type { OcsHttpError, OcsGroupfolder } from './types';
export declare function ocsGetGroupfolders(callback: (error: OcsHttpError, result?: OcsGroupfolder[]) => void): void;
export declare function ocsGetGroupfolder(groupfolderId: number, callback: (error: OcsHttpError, result?: OcsGroupfolder) => void): void;
export declare function ocsAddGroupfolder(mountpoint: string, callback: (error: OcsHttpError, result?: number) => void): void;
export declare function ocsRemoveGroupfolder(groupfolderId: number, callback: (error: OcsHttpError, result?: boolean) => void): void;
export declare function ocsAddGroupfolderGroup(groupfolderId: number, groupId: string, callback: (error: OcsHttpError, result?: boolean) => void): void;
export declare function ocsRemoveGroupfolderGroup(groupfolderId: number, groupId: string, callback: (error: OcsHttpError, result?: boolean) => void): void;
export declare function ocsSetGroupfolderPermissions(groupfolderId: number, groupId: string, permissions: number, callback: (error: OcsHttpError, result?: boolean) => void): void;
export declare function ocsEnableOrDisableGroupfolderACL(groupfolderId: number, enable: boolean, callback: (error: OcsHttpError, result?: boolean) => void): void;
export declare function ocsSetGroupfolderManageACL(groupfolderId: number, type: 'group' | 'user', id: string, manageACL: boolean, callback: (error: OcsHttpError, result?: boolean) => void): void;
export declare function ocsSetGroupfolderQuota(groupfolderId: number, quota: number, callback: (error: OcsHttpError, result?: boolean) => void): void;
export declare function ocsRenameGroupfolder(groupfolderId: number, mountpoint: string, callback: (error: OcsHttpError, result?: boolean) => void): void;
//# sourceMappingURL=groupfolders.d.ts.map