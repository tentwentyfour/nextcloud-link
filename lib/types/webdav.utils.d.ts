export type NAMESPACE = {
    full: string;
    short: string;
    elements: readonly string[];
};
export type ShortCodes = typeof NAMESPACES[number]["short"];
export type ShortCodeToNamespace = {
    [key in ShortCodes]: typeof NAMESPACES[number] & {
        short: key;
    };
};
export type ShortCodeElements<TShortCode extends ShortCodes> = "elements" extends keyof ShortCodeToNamespace[TShortCode] ? ShortCodeToNamespace[TShortCode]['elements'] : never;
export type DetailProperty<TShortCode extends ShortCodes, TElement extends ShortCodeElements<TShortCode> | string> = {
    namespaceShort: TShortCode;
    namespace: TElement;
    element: string;
    default?: any;
};
export type ExtractDetailProperties<TDetails extends DetailProperty<any, any>[]> = TDetails[number]['namespace'];
/**
 * All known namespaces and their elements that are used in the Nextcloud WebDAV API.
 * @see https://docs.nextcloud.com/server/latest/developer_manual/client_apis/WebDAV/basic.html#supported-properties
 */
declare const NAMESPACES: readonly [{
    readonly short: "d";
    readonly full: "DAV:";
    readonly elements: readonly ["creationdate", "getlastmodified", "getetag", "getcontenttype", "resourcetype", "getcontentlength", "getcontentlanguage", "displayname", "lockdiscovery", "supportedlock"];
}, {
    readonly short: "oc";
    readonly full: "http://owncloud.org/ns";
    readonly elements: readonly ["id", "fileid", "downloadURL", "permissions", "size", "quota-used-bytes", "quota-available-bytes", "tags", "favorite", "comments-href", "comments-count", "comments-unread", "owner-id", "owner-display-name", "share-types", "checksums", "has-preview", "rich-workspace-file", "rich-workspace"];
}, {
    readonly short: "nc";
    readonly full: "http://nextcloud.org/ns";
    readonly elements: readonly ["creation_time", "mount-type", "is-encrypted", "share-attributes", "sharees", "share-permissions", "acl-enabled", "acl-can-manage", "acl-list", "inherited-acl-list", "group-folder-id", "lock", "lock-owner-type", "lock-owner", "lock-owner-displayname", "lock-owner-editor", "lock-time", "lock-timeout", "lock-token", "contained-folder-count", "contained-file-count", "data-fingerprint", "upload_time", "note"];
}, {
    readonly short: "ocs";
    readonly full: "http://open-collaboration-services.org/ns";
    readonly elements: readonly ["share-permissions"];
}, {
    readonly short: "ocm";
    readonly full: "http://open-cloud-mesh.org/ns";
    readonly elements: readonly ["share-permissions"];
}];
/**
 * Creates a detail property for use with the various WebDAV methods.
 * @param namespace The namespace short code (e.g. `oc`)
 * @param element The element name (e.g. `fileid`)
 * @param defaultValue The default value to return if the property is not found
 *
 * @example
 * const fileidProperty = createDetailProperty('oc', 'fileid');
 *
 * const details = await client.getPathInfo('/path/to/file', {
 *  details: true,
 *  properties: [
 *    fileidProperty
 *  ]
 * });
 */
export declare function createDetailProperty<TShortCode extends ShortCodes, TElement extends ShortCodeElements<TShortCode>[number]>(namespace: TShortCode, element: TElement, defaultValue?: any): DetailProperty<TShortCode, TElement>;
export declare function createDetailProperty<TShortCode extends ShortCodes, TElement extends string>(namespace: TShortCode, element: TElement, defaultValue?: any): DetailProperty<TShortCode, TElement>;
/**
 * Converts a list of detail properties to an XML string.
 * @param details The prperties to convert to XML
 * @returns An XML string
 *
 * @note This is used internally by the client, but is exposed for use with the `propfind` method.
 * @see https://docs.nextcloud.com/server/latest/developer_manual/client_apis/WebDAV/basic.html#requesting-properties
 *
 * @example
 * const details = [
 * createDetailProperty('oc', 'fileid'),
 * createDetailProperty('oc', 'permissions'),
 * ];
 *
 * const xml = fileDetailsToXMLString(details);
 * // `<?xml version="1.0" encoding="UTF-8"?><d:propfind xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns"><d:prop><oc:fileid /><oc:permissions /></d:prop></d:propfind>`
 */
export declare function fileDetailsToXMLString(details: DetailProperty<any, any>[]): string;
export {};
//# sourceMappingURL=webdav.utils.d.ts.map