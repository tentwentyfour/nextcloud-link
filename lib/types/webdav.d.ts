/// <reference types="node" />
import * as Stream from "stream";
import type { WebDAVClientOptions, StatOptions, BufferLike, CreateDirectoryOptions, CreateReadStreamOptions, CreateWriteStreamOptions, FileStat, GetDirectoryContentsOptions, GetFileContentsOptions, PutFileContentsOptions, ResponseDataDetailed, WebDAVMethodOptions } from "webdav";
import { DetailProperty, ExtractDetailProperties } from "./webdav.utils";
export type WebDAVMethodOptionProperties<TPROPS extends DetailProperty<any, any>[]> = {
    properties?: TPROPS;
};
/**
 * A WebDAV client for specific for Nextcloud instances.
 * @param url The url to the Nextcloud instance.
 * @param options Optional options for the client.
 */
export declare class WebDavClient {
    private client;
    private root;
    private constructor();
    /**
     * WebDAV client factory method. Creates a new WebDAV client for the given url.
     *
     * @param url The url to the Nextcloud instance.
     * @param options Optional options for the client.
     */
    static create(url: string, options?: WebDAVClientOptions): Promise<WebDavClient>;
    private loadClient;
    /**
     * Returns the path to the root url.
     */
    getPath(): string;
    /**
     * Checks whether the client is ready.
     * @returns A promise that connects to the server.
     *
     * @example
     * checkConnectivity()
     *    .then(() => console.log('Connected'))
     *    .catch((error) => console.error(error));
     */
    checkConnectivity(): Promise<boolean>;
    /**
     * Checks whether the given path exists on the server.
     * @param path The path to the file or folder
     * @param options Optional options for the method. See the [WebDAVMethodOptions](https://www.npmjs.com/package/webdav/v/4.11.2#method-options) interface for more information.
     * @returns
     * - `true` if the path exists
     * - `false` if the path does not exist
     *
     * @example
     * exists('/foo/bar')
     *  .then((exists) => console.log(exists))
     */
    exists(path: string, options?: WebDAVMethodOptions): Promise<boolean>;
    /**
     *
     * @param path The path to the file or folder
     * @param options Optional options for the method.
     * @returns A promise that creates the directory.
     *
     * @throws {NextcloudError} If an error occurs.
     *
     * @example
     * touchFolder('/foo/bar')
     *  .then(() => console.log('Folder created'))
     *  .catch((error) => console.error(error));
     */
    touchFolder(path: string, options?: CreateDirectoryOptions): Promise<boolean>;
    /**
     * Renames a file or folder.
     * @param path The path to the file or folder
     * @param newName The new name of the file or folder
     * @param options Optional options for the method. See the [WebDAVMethodOptions](https://www.npmjs.com/package/webdav/v/4.11.2#method-options) interface for more information.
     * @returns A promise that renames the file or folder.
     *
     * @throws {NextcloudError} If an error occurs.
     *
     * @example
     * rename('/foo/bar', 'baz') // Renames the folder /foo/bar to /foo/baz
     *  .then(() => console.log('Renamed'))
     *  .catch((error) => console.error(error));
     */
    rename(path: string, newName: string, options?: WebDAVMethodOptions): Promise<void>;
    /**
     * Moves a file or folder.
     * @param path The path to the file or folder
     * @param destination The destination path
     * @param options Optional options for the method. See the [WebDAVMethodOptions](https://www.npmjs.com/package/webdav/v/4.11.2#method-options) interface for more information.
     * @returns A promise that moves the file or folder.
     *
     * @throws {NextcloudError} If an error occurs.
     *
     * @example
     * move('/foo/bar', '/bar/foo') // Moves the folder /foo/bar to /bar/foo
     *  .then(() => console.log('Moved'))
     *  .catch((error) => console.error(error));
     */
    move(path: string, destination: string, options?: WebDAVMethodOptions): Promise<void>;
    /**
     * Deletes a file or folder.
     * @param path The path to the file or folder
     * @param options Optional options for the method. See the [WebDAVMethodOptions](https://www.npmjs.com/package/webdav/v/4.11.2#method-options) interface for more information.
     * @returns A promise that deletes the file or folder.
     *
     * @throws {NextcloudError} If an error occurs.
     * @throws {NotFoundError} If the file or folder does not exist.
     *
     * @example
     * remove('/foo/bar') // Deletes the folder /foo/bar
     *    .then(() => console.log('Deleted'))
     *    .catch((error) => console.error(error));
     */
    remove(path: string, options?: WebDAVMethodOptions): Promise<void>;
    /**
     *
     * @param path The path to the file or folder
     * @param content The content to write to the file
     * @param options Optional options for the method. See the [PutFileContentsOptions](https://www.npmjs.com/package/webdav/v/4.11.2#user-content-putfilecontents) interface for more information.
     * @returns A promise that writes the content to the file.
     *  `true` if the file was written.
     *  `false` otherwise.
     */
    put(path: string, content: string | BufferLike | Stream.Readable, options?: PutFileContentsOptions): Promise<boolean>;
    /**
     * Gets the content of a file.
     * @param path The path to the file
     * @param options The options for the method. See the [GetFileContentsOptions](https://www.npmjs.com/package/webdav/v/4.11.2#user-content-getfilecontents) interface for more information.
     * @returns A promise that gets the content of the file.
     */
    get(path: string, options?: GetFileContentsOptions): Promise<string | BufferLike | ResponseDataDetailed<string | BufferLike>>;
    /**
     * Creates a folder at the given path. Nested or non-existent folders will be created.
     * @param path The path to the file or folder
     * @returns A promise that creates the folder.
     *
     * @deprecated Use `touchFolder` instead.
     * @example
     *
     * createFolder('/foo/bar') // Creates the folder /foo/bar
     */
    createFolderHierarchy(path: string): Promise<boolean>;
    /**
     * Get all files and folders in the given folder.
     * @param path The path to the file or folder
     * @param options Optional options for the method.
     * @returns A promise that gets the files and folders in the given folder.
     *
     * @throws {NextcloudError} If an error occurs.
     * @throws {NotFoundError} If the folder does not exist.
     *
     * @example
     * getFilesDetailed('/foo/bar') // Gets all files and folders in /foo/bar
     */
    getFilesDetailed<TProps extends DetailProperty<any, any>[]>(path: string, options: GetDirectoryContentsOptions & {
        details: true;
    } & WebDAVMethodOptionProperties<TProps>): Promise<ResponseDataDetailed<(FileStat & {
        props: Record<ExtractDetailProperties<TProps>, any>;
    })[]>>;
    getFilesDetailed(path: string, options: GetDirectoryContentsOptions & {
        details?: false | undefined;
    }): Promise<FileStat[]>;
    getFilesDetailed(path: string, options?: GetDirectoryContentsOptions): Promise<FileStat[]>;
    /**
     * Get all files and folders in the given folder.
     * @param path The path to the file or folder
     * @returns A promise that gets all files and folders in the given folder.
     *
     * @throws {NextcloudError} If an error occurs.
     * @throws {NotFoundError} If the folder does not exist.
     *
     * @deprecated Use `getFilesDetailed` instead.
     *
     * @example
     * getFiles('/foo/bar') // Gets all files and folders in /foo/bar
     */
    getFiles(path: string): Promise<string[]>;
    /**
     * Get all file and folder details in the given folder.
     * @param path The path to the file or folder
     * @returns A promise that gets all files and folders in the given folder.
     *
     * @throws {NextcloudError} If an error occurs.
     * @throws {NotFoundError} If the folder does not exist.
     *
     * @deprecated Use `getFilesDetailed` instead.
     *
     * @example
     * getFolderFileDetails('/foo/bar') // Gets all files and folders in /foo/bar
     */
    getFolderFileDetails(path: string, extraProperties?: DetailProperty<any, string>[]): Promise<{
        isFile: boolean;
        isDirectory: boolean;
        lastModified: string;
        href: string;
        name: string;
        extraProperties: import("webdav").DAVResultResponseProps & Record<string, any>;
        filename: string;
        basename: string;
        lastmod: string;
        size: number;
        type: "file" | "directory";
        etag: string;
        mime?: string;
        props: import("webdav").DAVResultResponseProps & Record<string, any>;
    }[]>;
    /**
     * Get the details of a file or folder.
     * @param path The path to the file or folder
     * @param options Optional options for the method.
     * @returns A promise that gets the details of the file or folder.
     *
     * @throws {NextcloudError} If an error occurs.
     * @throws {NotFoundError} If the file or folder does not exist.
     *
     * @example
     * getPathInfo('/foo/bar') // Gets the details of /foo/bar
     */
    getPathInfo<TProps extends DetailProperty<any, any>[]>(path: string, options: StatOptions & {
        details: true;
    } & WebDAVMethodOptionProperties<TProps>): Promise<ResponseDataDetailed<FileStat & {
        props: Record<ExtractDetailProperties<TProps>, any>;
    }>>;
    getPathInfo(path: string, options: StatOptions & {
        details?: false | undefined;
    }): Promise<FileStat>;
    getPathInfo(path: string, options?: StatOptions): Promise<FileStat>;
    /**
     * Get the details of a file or folder.
     * @param path The path to the file or folder
     * @param extraProperties The extra properties to get
     * @returns A promise that gets the details of the file or folder.
     *
     * @deprecated Use `getPathInfo` instead.
     */
    getFolderProperties(path: string, extraProperties?: DetailProperty<any, string>[]): Promise<FileStat & Record<string, any>>;
    /**
     * Get a read stream for a file.
     * @param path The path to the file or folder
     * @param options Optional options for the method.
     * @returns A promise which returns a read stream.
     *
     * @note Although the stream is returned immediately, the stream will only start downloading once the stream is connected to a destination.
     */
    getReadStream(path: string, options?: CreateReadStreamOptions): Promise<Stream.Readable>;
    /**
     * Get a write stream for a file.
     * @param path The path to the file or folder
     * @param options Optional options for the method.
     * @returns A promise which returns a write stream.
     *
     * @note Although the stream is returned immediately, the stream will only start uploading once the stream is connected to a destination.
     * @note The write stream will only start uploading once the stream is closed.
     * @note The write stream will emit a `finished` event once the upload has finished.
     */
    getWriteStream(path: string, options?: CreateWriteStreamOptions & {
        onFinished: () => void;
    }): Promise<Stream.Writable>;
    /**
     * Upload to a file from a stream.
     * @param path The path to the file
     * @param readStream The read stream to upload
     * @returns A promise that uploads the given stream to the given path.
     */
    uploadFromStream(path: string, readStream: Stream.Readable): Promise<void>;
    /**
     * Download a file to a stream.
     * @param path The path to the file
     * @param writeStream The write stream to download to
     * @returns A promise that downloads the given path to the given stream.
     */
    downloadToStream(path: string, writeStream: Stream.Writable): Promise<void>;
}
//# sourceMappingURL=webdav.d.ts.map