import { OcsSharePermissions } from './types';
export declare function rejectWithOcsError(message: string, reason: string, identifier?: string | number, statusCode?: string): Promise<never>;
export declare function assignDefined(target: any, ...sources: any[]): void;
export declare function ocsSharePermissionsToText(permissions: OcsSharePermissions): string;
