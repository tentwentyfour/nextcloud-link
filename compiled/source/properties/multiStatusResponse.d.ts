interface PropertyStatus {
    status: string;
    properties: object;
}
export declare class MultiStatusResponse {
    href: string | null;
    propStat: PropertyStatus[];
    static xmlNamespaces: object;
    constructor(href: string | null, propStat: PropertyStatus[]);
    private static parsePropertyStatus;
    private static parseResponsePart;
    static fromString: (doc: string) => MultiStatusResponse[];
}
export {};
