export declare class Project {
    readonly owner: string;
    readonly name: string;
    readonly foreignId: string;
    readonly id?: string;
    readonly url?: string;
    constructor(owner: string, name: string, foreignId: string, id?: string, url?: string);
}
