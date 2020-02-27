interface Property {
    name: string;
    value: string;
}
export declare class FileProps {
    readonly path: string;
    readonly props: object;
    readonly dirtyProps: object;
    constructor(path: string, props: object, dirtyProps?: object);
    withProperty: (name: string, value: string) => FileProps;
    getProperty: (name: string) => string;
    all: () => Property[];
    dirty: () => Property[];
}
export {};
