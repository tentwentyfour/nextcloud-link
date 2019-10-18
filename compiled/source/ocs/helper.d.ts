import { OcsSharePermissions } from './types';
export interface ErrorInfo {
    expectedErrorCodes?: number[];
    customErrors?: {
        [key: number]: string;
    };
    identifier?: string | number;
    message: string;
    useMeta: boolean;
}
export declare function rejectWithOcsError(error: any, errorInfo: ErrorInfo): Promise<never>;
export declare function assignDefined(target: any, ...sources: any[]): void;
export declare function ocsSharePermissionsToText(permissions: OcsSharePermissions): string;
