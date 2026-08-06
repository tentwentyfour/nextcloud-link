export declare const NextCloudException: new (message: string, subError?: Error) => Error;
export declare const NextCloudServerException: new (message: string, subError?: Error) => Error;
export declare const NextCloudClientException: new (message: string, subError?: Error) => Error;
export declare const ForbiddenError: new (path: string) => Error;
export declare const NotFoundError: new (path: string) => Error;
export declare const NotReadyError: new () => Error;
export declare const UnreachableError: new () => Error;
export declare const IncorrectPathTypeError: new (options: {
    path: string;
    type: string;
}) => Error;
export declare const ConflictError: new (path: string) => Error;
export declare const OcsError: new (options: {
    message: string;
    identifier?: string | number;
    reason: string;
    statusCode?: string | number;
}) => Error;
export declare const BadArgumentError: new (message: string) => Error;
//# sourceMappingURL=errors.d.ts.map