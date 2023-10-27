import * as Stream from "stream"

import { Result, Optional } from "lonad";

import {
  BufferLike,
  CreateDirectoryOptions,
  CreateReadStreamOptions,
  CreateWriteStreamOptions,
  FileStat,
  GetDirectoryContentsOptions,
  GetFileContentsOptions,
  PutFileContentsOptions,
  ResponseDataDetailed,
  StatOptions,
  WebDAVClientOptions,
  WebDAVMethodOptions,
  createClient,
} from "webdav";

import { BadArgumentError } from "./errors";

import { wrapClient, wrapError } from "./webdav.wrapper";

import {
  DetailProperty,
  fileDetailsToXMLString,
  createDetailProperty,
  ExtractDetailProperties,
} from "./webdav.utils";

const defaultProperties = [
  createDetailProperty("d", "creationdate"),
  createDetailProperty("d", "getlastmodified"),
  createDetailProperty("d", "getetag"),
  createDetailProperty("d", "resourcetype"),
  createDetailProperty("d", "getcontentlength"),
  createDetailProperty("d", "getcontenttype"),
  createDetailProperty("oc", "fileid"),
  createDetailProperty("oc", "owner-id"),
];

export type WebDAVMethodOptionProperties<
  TPROPS extends DetailProperty<any, any>[]
> = {
  properties?: TPROPS;
};

/**
 * A WebDAV client for specific for Nextcloud instances.
 * @param url The url to the Nextcloud instance.
 * @param options Optional options for the client.
 */
export class WebDavClient {
  private client: ReturnType<typeof createClient>;
  private root: string;

  constructor(url: string, options: WebDAVClientOptions = {}) {
    this.root = nextCloudPath(options.username);
    this.client = wrapClient(
      createClient(nextcloudRoot(url, this.root), options)
    );
  }

  /**
   * Returns the path to the root url.
   */
  public getPath() {
    return this.root;
  }

  /**
   * Checks whether the client is ready.
   * @returns A promise that connects to the server.
   *
   * @example
   * checkConnectivity()
   *    .then(() => console.log('Connected'))
   *    .catch((error) => console.error(error));
   */
  public async checkConnectivity() {
    return Result.fromPromise(this.client.getDirectoryContents("/"))
      .map(Boolean)
      .getOrElse(false);
  }

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
  public async exists(
    path: string,
    options: WebDAVMethodOptions = {}
  ): Promise<boolean> {
    return Result.fromPromise((this.client.exists as any)(path, options))
      .recover(() => false)
      .toPromise();
  }

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
  public async touchFolder(
    path: string,
    options: CreateDirectoryOptions = { recursive: true }
  ) {
    return Result.fromPromise(this.exists(path))
      .reject(Boolean)
      .expectMap(() => this.client.createDirectory(path, options))
      .map(() => true)
      .recover(() => false)
      .toPromise();
  }

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
  public async rename(
    path: string,
    newName: string,
    options: WebDAVMethodOptions = {}
  ): Promise<void> {
    const basePath = Optional.fromNullable(path)
      .reject((path) => path === "")
      .map((path) => path.slice(0, path.lastIndexOf("/") + 1));

    const newPath = Optional.fromNullable(newName)
      .reject((path) => path === "")
      .flatMap((newName) => basePath.map((basePath) => basePath + newName));

    return Result.expect(newPath)
      .abortOnErrorWith(() => new BadArgumentError("New name must not be empty."))
      .map((newPath) => this.move(path, newPath, options))
      .toPromise();
  }

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
  public async move(
    path: string,
    destination: string,
    options: WebDAVMethodOptions = {}
  ): Promise<void> {
    return (this.client.moveFile as any)(path, destination, options);
  }

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
  public async remove(
    path: string,
    options: WebDAVMethodOptions = {}
  ): Promise<void> {
    return (this.client.deleteFile as any)(path, options);
  }

  /**
   *
   * @param path The path to the file or folder
   * @param content The content to write to the file
   * @param options Optional options for the method. See the [PutFileContentsOptions](https://www.npmjs.com/package/webdav/v/4.11.2#user-content-putfilecontents) interface for more information.
   * @returns A promise that writes the content to the file.
   *  `true` if the file was written.
   *  `false` otherwise.
   */
  public async put(
    path: string,
    content: string | BufferLike | Stream.Readable,
    options?: PutFileContentsOptions
  ) {
    return this.client.putFileContents(path, content, options);
  }

  /**
   * Gets the content of a file.
   * @param path The path to the file
   * @param options The options for the method. See the [GetFileContentsOptions](https://www.npmjs.com/package/webdav/v/4.11.2#user-content-getfilecontents) interface for more information.
   * @returns A promise that gets the content of the file.
   */
  public async get(path: string, options?: GetFileContentsOptions) {
    return this.client.getFileContents(path, options);
  }

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
  public async createFolderHierarchy(path: string): Promise<boolean> {
    return this.touchFolder(path, { recursive: true });
  }

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
  public async getFilesDetailed<TProps extends DetailProperty<any, any>[]>(
    path: string,
    options: GetDirectoryContentsOptions & {
      details: true;
    } & WebDAVMethodOptionProperties<TProps>
  ): Promise<
    ResponseDataDetailed<
      (FileStat & { props: Record<ExtractDetailProperties<TProps>, any> })[]
    >
  >;
  public async getFilesDetailed(
    path: string,
    options: GetDirectoryContentsOptions & { details?: false | undefined }
  ): Promise<FileStat[]>;
  public async getFilesDetailed(
    path: string,
    options?: GetDirectoryContentsOptions
  ): Promise<FileStat[]>;
  public async getFilesDetailed(
    path: string,
    options: GetDirectoryContentsOptions = {}
  ) {
    const formattedOptions = formatOptions(options);

    return Result.fromPromise(
      this.client.getDirectoryContents(path, formattedOptions)
    )
      .map((result) => {
        if (isDetailedResult(result)) {
          result.data = result.data.map((file) => ({
            ...file,
            props: setDefaults(file, formattedOptions.properties),
          }));
        } else {
          result = result.map((file) => ({
            ...file,
            props: setDefaults(file, formattedOptions.properties),
          }));
        }

        return result;
      })
      .toPromise();
  }

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
  public async getFiles(path: string): Promise<string[]> {
    return Result.fromPromise(this.getFilesDetailed(path, { details: false }))
      .map((files) => files.map((file) => file.basename))
      .toPromise();
  }

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
  public async getFolderFileDetails(
    path: string,
    extraProperties?: DetailProperty<any, string>[]
  ) {
    return Result.fromPromise(
      this.getFilesDetailed(path, {
        details: true,
        properties: extraProperties,
      })
    )
      .map((files) => files.data)
      .map((files) =>
        files.map((file) => ({
          ...file,
          isFile: file.type === "file",
          isDirectory: file.type === "directory",
          lastModified: file.lastmod,
          href: `${this.root}${path}/${file.basename}`,
          name: file.basename,
          extraProperties: (file.props || {}) as typeof file.props,
        }))
      )
      .toPromise();
  }

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
  public async getPathInfo<TProps extends DetailProperty<any, any>[]>(
    path: string,
    options: StatOptions & {
      details: true;
    } & WebDAVMethodOptionProperties<TProps>
  ): Promise<
    ResponseDataDetailed<
      FileStat & { props: Record<ExtractDetailProperties<TProps>, any> }
    >
  >;
  public async getPathInfo(
    path: string,
    options: StatOptions & { details?: false | undefined }
  ): Promise<FileStat>;
  public async getPathInfo(
    path: string,
    options?: StatOptions
  ): Promise<FileStat>;
  public async getPathInfo(path: string, options: StatOptions = {}) {
    const formattedOptions = formatOptions(options);

    return Result.fromPromise(this.client.stat(path, formattedOptions))
      .map((result) => {
        if (isDetailedResult(result)) {
          result.data.props = setDefaults(
            result.data,
            formattedOptions.properties
          );
        } else {
          result.props = setDefaults(result, formattedOptions.properties);
        }

        return result;
      })
      .toPromise();
  }

  /**
   * Get the details of a file or folder.
   * @param path The path to the file or folder
   * @param extraProperties The extra properties to get
   * @returns A promise that gets the details of the file or folder.
   *
   * @deprecated Use `getPathInfo` instead.
   */
  public async getFolderProperties(
    path: string,
    extraProperties?: DetailProperty<any, string>[]
  ): Promise<FileStat & Record<string, any>> {
    const res = await this.getPathInfo(path, {
      details: true,
      properties: extraProperties,
    });
    const data = Result.expect(res.data)
      .map((data) => ({
        ...data,
        ...extraProperties.reduce(
          (acc, curr) => ({
            ...acc,
            [`${curr.namespaceShort}:${curr.element}`]:
              data.props[curr.element],
          }),
          {}
        ),
      }))
      .getOrElse(res.data);

    return data;
  }

  /**
   * Get a read stream for a file.
   * @param path The path to the file or folder
   * @param options Optional options for the method.
   * @returns A promise which returns a read stream.
   *
   * @note Although the stream is returned immediately, the stream will only start downloading once the stream is connected to a destination.
   */
  public async getReadStream(
    path: string,
    options?: CreateReadStreamOptions
  ): Promise<Stream.Readable> {
    const readStream = new Stream.PassThrough();

    await this.get(path, { details: false });

    const remoteReadStream = await this.client.createReadStream(path, options);
    remoteReadStream.pipe(readStream);

    remoteReadStream.on("error", (err) =>
      readStream.emit("error", wrapError(err, path))
    );

    return readStream;
  }

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
  public async getWriteStream(
    path: string,
    options?: CreateWriteStreamOptions & { onFinished: () => void }
  ): Promise<Stream.Writable> {
    const writeStream = new Stream.PassThrough();
    const { overwrite = false, ...otherOptions } = options ?? {};

    await this.put(path, "", { overwrite, ...otherOptions });

    this.put(path, writeStream, { overwrite, ...otherOptions })
      .then(() => options?.onFinished())
      .catch((err) => writeStream.emit("error", wrapError(err)));

    return writeStream;
  }

  /**
   * Upload to a file from a stream.
   * @param path The path to the file
   * @param readStream The read stream to upload
   * @returns A promise that uploads the given stream to the given path.
   */
  public async uploadFromStream(
    path: string,
    readStream: Stream.Readable
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const writeStream = await this.getWriteStream(path, {
          overwrite: true,
          onFinished: () => resolve(),
        });

        writeStream.on("error", (err) => reject(err));

        return await pipeStreams(readStream, writeStream);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Download a file to a stream.
   * @param path The path to the file
   * @param writeStream The write stream to download to
   * @returns A promise that downloads the given path to the given stream.
   */
  public async downloadToStream(
    path: string,
    writeStream: Stream.Writable
  ): Promise<void> {
    const readStream = await this.getReadStream(path);

    await pipeStreams(readStream, writeStream);
  }
}

/**
 * Returns the root URL for the Nextcloud instance
 * @param url The Nextcloud instance URL
 * @param username The Nextcloud username
 * @returns The root URL for the Nextcloud instance
 * @private
 *
 * @example
 * nextcloudRoot('https://example.com/nextcloud', 'jack');
 * // => 'https://example.com/nextcloud/remote.php/dav/files/jack/'
 */
function nextcloudRoot(url: string, path: string) {
  const urlNoTrailingSlash = url.trimEnd().replace(/\/$/, "");
  const pathNoLeadingSlash = path.trimStart().replace(/^\//, "");

  return `${urlNoTrailingSlash}/${pathNoLeadingSlash}`;
}

function nextCloudPath(username: string) {
  return `/remote.php/dav/files/${username}`;
}

function formatOptions(
  options?: WebDAVMethodOptionProperties<any> & {
    data?: WebDAVMethodOptions["data"];
    details?: boolean;
    properties?: DetailProperty<any, any>[];
  }
) {
  if (!options || !options.details) {
    return options;
  }

  const props = defaultProperties.concat(options.properties ?? []);
  const data = !options.data
    ? Result.expect(props)
        .filter((properties) => properties.length > 0)
        .map((properties) => fileDetailsToXMLString(properties as any))
        .getOrElse(options.data)
    : options.data;

  return {
    ...options,
    data: data,
    properties: props,
  };
}

/**
 * Sets the defaults for the given result
 * @param result The result to set the defaults for
 * @param props The properties to set the defaults for
 * @returns The result with the defaults set
 */
function setDefaults(result: FileStat, props: DetailProperty<any, any>[]) {
  return {
    ...props?.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.element]: curr.default,
      }),
      {}
    ),
    ...result.props,
  };
}

/**
 * Checks if the given result is a detailed result
 * @param result The result to check
 * @returns Whether the result is a detailed result
 */
function isDetailedResult<TResult>(
  result: TResult | {}
): result is ResponseDataDetailed<any> {
  return result.hasOwnProperty("data") && result.hasOwnProperty("status");
}

/**
 * Pipes a read stream to a write stream
 * @param readStream The read stream
 * @param writeStream The write stream
 * @returns A promise that resolves when the streams have been piped
 */
async function pipeStreams(
  readStream: Stream.Readable,
  writeStream: Stream.Writable
): Promise<void> {
  return new Promise((resolve, reject) => {
    readStream.on("error", fail);
    writeStream.on("error", fail);

    // event from WebDav.Stream's deprecated request in case of uploadFromStream
    writeStream.on("end", resolve);

    // event from Node.js write stream in case of downloadToStream
    writeStream.on("close", resolve);

    readStream.pipe(writeStream);

    function fail(error: Error) {
      reject(wrapError(error));
    }
  });
}
