import { AxiosInstance } from 'axios';
import { Tag } from './tag';
import { FileProps } from './fileProps';
export declare class PropertiesClient {
    readonly connection: AxiosInstance;
    constructor(baseURL: string, username: string, password: string);
    getFileId: (path: string) => Promise<string>;
    addTag: (fileId: string | number, tag: Tag) => Promise<void>;
    removeTag: (fileId: string | number, tag: Tag) => Promise<void>;
    getTags: (fileId: string | number) => Promise<Tag[]>;
    getFileProps: (path: string, names?: string[]) => Promise<FileProps>;
    saveProps: (fileProps: FileProps) => Promise<void>;
    private _props;
    createTag: (name: string) => Promise<Tag>;
    private _parseIdFromLocation;
    private _parseMultiStatus;
}
