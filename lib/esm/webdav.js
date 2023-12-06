import * as Stream from "stream";
import { Result, Optional } from "lonad";
import { BadArgumentError } from "./errors";
import { wrapClient, wrapError } from "./webdav.wrapper";
import { fileDetailsToXMLString, createDetailProperty, } from "./webdav.utils";
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
export class WebDavClient {
    constructor() { }
    static async create(url, options = {}) {
        const thisClient = new WebDavClient();
        thisClient.root = nextCloudPath(options.username);
        thisClient.client = await thisClient.loadClient(url, options);
        return thisClient;
    }
    async loadClient(url, options = {}) {
        const webDav = await Function('return import("webdav");')();
        if (!webDav) {
            throw new Error("Could not load webdav package");
        }
        return wrapClient(webDav.createClient(nextcloudRoot(url, this.root), options));
    }
    getPath() {
        return this.root;
    }
    async checkConnectivity() {
        return Result.fromPromise(this.client.getDirectoryContents("/"))
            .map(Boolean)
            .getOrElse(false);
    }
    async exists(path, options = {}) {
        return Result.fromPromise(this.client.exists(path, options))
            .recover(() => false)
            .toPromise();
    }
    async touchFolder(path, options = { recursive: true }) {
        return Result.fromPromise(this.exists(path))
            .reject(Boolean)
            .expectMap(() => this.client.createDirectory(path, options))
            .map(() => true)
            .recover(() => false)
            .toPromise();
    }
    async rename(path, newName, options = {}) {
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
    async move(path, destination, options = {}) {
        return this.client.moveFile(path, destination, options);
    }
    async remove(path, options = {}) {
        return this.client.deleteFile(path, options);
    }
    async put(path, content, options) {
        return this.client.putFileContents(path, content, options);
    }
    async get(path, options) {
        return this.client.getFileContents(path, options);
    }
    async createFolderHierarchy(path) {
        return this.touchFolder(path, { recursive: true });
    }
    async getFilesDetailed(path, options = {}) {
        const formattedOptions = formatOptions(options);
        return Result.fromPromise(this.client.getDirectoryContents(path, formattedOptions))
            .map((result) => {
            if (isDetailedResult(result)) {
                result.data = result.data.map((file) => ({
                    ...file,
                    props: setDefaults(file, formattedOptions.properties),
                }));
            }
            else {
                result = result.map((file) => ({
                    ...file,
                    props: setDefaults(file, formattedOptions.properties),
                }));
            }
            return result;
        })
            .toPromise();
    }
    async getFiles(path) {
        return Result.fromPromise(this.getFilesDetailed(path, { details: false }))
            .map((files) => files.map((file) => file.basename))
            .toPromise();
    }
    async getFolderFileDetails(path, extraProperties) {
        return Result.fromPromise(this.getFilesDetailed(path, {
            details: true,
            properties: extraProperties,
        }))
            .map((files) => files.data)
            .map((files) => files.map((file) => ({
            ...file,
            isFile: file.type === "file",
            isDirectory: file.type === "directory",
            lastModified: file.lastmod,
            href: `${this.root}${path}/${file.basename}`,
            name: file.basename,
            extraProperties: (file.props || {}),
        })))
            .toPromise();
    }
    async getPathInfo(path, options = {}) {
        const formattedOptions = formatOptions(options);
        return Result.fromPromise(this.client.stat(path, formattedOptions))
            .map((result) => {
            if (isDetailedResult(result)) {
                result.data.props = setDefaults(result.data, formattedOptions.properties);
            }
            else {
                result.props = setDefaults(result, formattedOptions.properties);
            }
            return result;
        })
            .toPromise();
    }
    async getFolderProperties(path, extraProperties) {
        const res = await this.getPathInfo(path, {
            details: true,
            properties: extraProperties,
        });
        const data = Result.expect(res.data)
            .map((data) => ({
            ...data,
            ...extraProperties.reduce((acc, curr) => ({
                ...acc,
                [`${curr.namespaceShort}:${curr.element}`]: data.props[curr.element],
            }), {}),
        }))
            .getOrElse(res.data);
        return data;
    }
    async getReadStream(path, options) {
        const readStream = new Stream.PassThrough();
        await this.get(path, { details: false });
        const remoteReadStream = await this.client.createReadStream(path, options);
        remoteReadStream.pipe(readStream);
        remoteReadStream.on("error", (err) => readStream.emit("error", wrapError(err, path)));
        return readStream;
    }
    async getWriteStream(path, options) {
        const writeStream = new Stream.PassThrough();
        const { overwrite = false, ...otherOptions } = options ?? {};
        await this.put(path, "", { overwrite, ...otherOptions });
        this.put(path, writeStream, { overwrite, ...otherOptions })
            .then(() => options?.onFinished())
            .catch((err) => writeStream.emit("error", wrapError(err)));
        return writeStream;
    }
    async uploadFromStream(path, readStream) {
        return new Promise(async (resolve, reject) => {
            try {
                const writeStream = await this.getWriteStream(path, {
                    overwrite: true,
                    onFinished: () => resolve(),
                });
                writeStream.on("error", (err) => reject(err));
                return await pipeStreams(readStream, writeStream);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    async downloadToStream(path, writeStream) {
        const readStream = await this.getReadStream(path);
        await pipeStreams(readStream, writeStream);
    }
}
function nextcloudRoot(url, path) {
    const urlNoTrailingSlash = url.trimEnd().replace(/\/$/, "");
    const pathNoLeadingSlash = path.trimStart().replace(/^\//, "");
    return `${urlNoTrailingSlash}/${pathNoLeadingSlash}`;
}
function nextCloudPath(username) {
    return `/remote.php/dav/files/${username}`;
}
function formatOptions(options) {
    if (!options || !options.details) {
        return options;
    }
    const props = defaultProperties.concat(options.properties ?? []);
    const data = !options.data
        ? Result.expect(props)
            .filter((properties) => properties.length > 0)
            .map((properties) => fileDetailsToXMLString(properties))
            .getOrElse(options.data)
        : options.data;
    return {
        ...options,
        data: data,
        properties: props,
    };
}
function setDefaults(result, props) {
    return {
        ...props?.reduce((acc, curr) => ({
            ...acc,
            [curr.element]: curr.default,
        }), {}),
        ...result.props,
    };
}
function isDetailedResult(result) {
    return result.hasOwnProperty("data") && result.hasOwnProperty("status");
}
async function pipeStreams(readStream, writeStream) {
    return new Promise((resolve, reject) => {
        readStream.on("error", fail);
        writeStream.on("error", fail);
        writeStream.on("end", resolve);
        writeStream.on("close", resolve);
        readStream.pipe(writeStream);
        function fail(error) {
            reject(wrapError(error));
        }
    });
}
