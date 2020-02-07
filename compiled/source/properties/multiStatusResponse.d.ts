interface PropertyStatus {
    status: string;
    properties: object;
}
export declare class MultiStatusResponse {
    href: string | null;
    propStat: PropertyStatus[];
    static xmlNamespaces: object;
    constructor(href: string | null, propStat: PropertyStatus[]);
    static fromString: (doc: string) => MultiStatusResponse[];
    private static _parsePropNode;
    private static _getElementsByTagName;
}
export {};
