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
type OmitLastParameter<TFn extends (...args: any[]) => any> = Parameters<TFn> extends [...infer PARAMS, any] ? PARAMS : Parameters<TFn>;
type LastParameter<TFn extends (...args: any[]) => any> = Parameters<TFn> extends [...any[], infer LAST] ? LAST : never;
type ExtractDataTypeFromCallback<TArgument> = TArgument extends (err: any, data: infer TData) => any ? TData : never;
export declare function rejectWithOcsError(error: any, errorInfo: ErrorInfo): Promise<never>;
export declare function assignDefined(target: any, ...sources: any[]): void;
export declare function ocsSharePermissionsToText(permissions: OcsSharePermissions): string;
/**
 * Promisify a function that takes a callback as its last parameter
 * @param fn The function to promisify
 * @returns A function that returns a promise
 *
 * @note This is a simple replacement for the `promisify` function from the `util` package which is not available in the browser (unless you polyfill it)
 */
export declare function promisify<TFn extends (...args: any[]) => any, CallbackData = ExtractDataTypeFromCallback<LastParameter<TFn>>>(fn: TFn): (...args: OmitLastParameter<TFn>) => Promise<CallbackData>;
export {};
//# sourceMappingURL=helper.d.ts.map