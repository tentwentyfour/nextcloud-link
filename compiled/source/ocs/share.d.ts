import { OcsSharePermissions, OcsEditShareField, OcsHttpError, OcsShareType, OcsShare } from './types';
export declare function ocsGetShares(path: string, includeReshares: boolean, showForSubFiles: boolean, callback: (error: OcsHttpError, result?: OcsShare[]) => void): void;
export declare function ocsGetShare(shareId: number | string, callback: (error: OcsHttpError, result?: OcsShare) => void): void;
export declare function ocsDeleteShare(shareId: number | string, callback: (error: OcsHttpError, result?: boolean) => void): void;
export declare function ocsAddShare(path: string, shareType: OcsShareType, shareWith: string, permissions: OcsSharePermissions, password: string, publicUpload: boolean, callback: (error: OcsHttpError, result?: OcsShare) => void): void;
export declare function ocsEditShare(shareId: number | string, field: OcsEditShareField, value: string, callback: (error: OcsHttpError, result?: OcsShare) => void): void;
