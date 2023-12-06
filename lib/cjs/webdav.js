"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebDavClient = void 0;
const Stream = __importStar(require("stream"));
const lonad_1 = require("lonad");
const errors_1 = require("./errors");
const webdav_wrapper_1 = require("./webdav.wrapper");
const webdav_utils_1 = require("./webdav.utils");
const defaultProperties = [
    (0, webdav_utils_1.createDetailProperty)("d", "creationdate"),
    (0, webdav_utils_1.createDetailProperty)("d", "getlastmodified"),
    (0, webdav_utils_1.createDetailProperty)("d", "getetag"),
    (0, webdav_utils_1.createDetailProperty)("d", "resourcetype"),
    (0, webdav_utils_1.createDetailProperty)("d", "getcontentlength"),
    (0, webdav_utils_1.createDetailProperty)("d", "getcontenttype"),
    (0, webdav_utils_1.createDetailProperty)("oc", "fileid"),
    (0, webdav_utils_1.createDetailProperty)("oc", "owner-id"),
];
class WebDavClient {
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
        return (0, webdav_wrapper_1.wrapClient)(webDav.createClient(nextcloudRoot(url, this.root), options));
    }
    getPath() {
        return this.root;
    }
    async checkConnectivity() {
        return lonad_1.Result.fromPromise(this.client.getDirectoryContents("/"))
            .map(Boolean)
            .getOrElse(false);
    }
    async exists(path, options = {}) {
        return lonad_1.Result.fromPromise(this.client.exists(path, options))
            .recover(() => false)
            .toPromise();
    }
    async touchFolder(path, options = { recursive: true }) {
        return lonad_1.Result.fromPromise(this.exists(path))
            .reject(Boolean)
            .expectMap(() => this.client.createDirectory(path, options))
            .map(() => true)
            .recover(() => false)
            .toPromise();
    }
    async rename(path, newName, options = {}) {
        const basePath = lonad_1.Optional.fromNullable(path)
            .reject((path) => path === "")
            .map((path) => path.slice(0, path.lastIndexOf("/") + 1));
        const newPath = lonad_1.Optional.fromNullable(newName)
            .reject((path) => path === "")
            .flatMap((newName) => basePath.map((basePath) => basePath + newName));
        return lonad_1.Result.expect(newPath)
            .abortOnErrorWith(() => new errors_1.BadArgumentError("New name must not be empty."))
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
        return lonad_1.Result.fromPromise(this.client.getDirectoryContents(path, formattedOptions))
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
        return lonad_1.Result.fromPromise(this.getFilesDetailed(path, { details: false }))
            .map((files) => files.map((file) => file.basename))
            .toPromise();
    }
    async getFolderFileDetails(path, extraProperties) {
        return lonad_1.Result.fromPromise(this.getFilesDetailed(path, {
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
        return lonad_1.Result.fromPromise(this.client.stat(path, formattedOptions))
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
        const data = lonad_1.Result.expect(res.data)
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
        remoteReadStream.on("error", (err) => readStream.emit("error", (0, webdav_wrapper_1.wrapError)(err, path)));
        return readStream;
    }
    async getWriteStream(path, options) {
        const writeStream = new Stream.PassThrough();
        const { overwrite = false, ...otherOptions } = options ?? {};
        await this.put(path, "", { overwrite, ...otherOptions });
        this.put(path, writeStream, { overwrite, ...otherOptions })
            .then(() => options?.onFinished())
            .catch((err) => writeStream.emit("error", (0, webdav_wrapper_1.wrapError)(err)));
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
exports.WebDavClient = WebDavClient;
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
        ? lonad_1.Result.expect(props)
            .filter((properties) => properties.length > 0)
            .map((properties) => (0, webdav_utils_1.fileDetailsToXMLString)(properties))
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
            reject((0, webdav_wrapper_1.wrapError)(error));
        }
    });
}
