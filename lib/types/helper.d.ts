/**
 * Creates a ownCloud detail property for use with the various WebDAV methods.
 * @param element The element name (e.g. `fileid`)
 * @param nativeType **UNUSED** - The native type of the property (e.g. `number`)
 * @param defaultValue The default value to return if the property is not found
 * @returns A detail property
 *
 * @deprecated Use `createDetailProperty` instead
 */
export declare function createOwnCloudFileDetailProperty(element: string, nativeType?: boolean, defaultValue?: any): import("./webdav.utils").DetailProperty<"oc", string>;
/**
 * Creates a NextCloud detail property for use with the various WebDAV methods.
 * @param element The element name (e.g. `fileid`)
 * @param nativeType **UNUSED** - The native type of the property (e.g. `number`)
 * @param defaultValue The default value to return if the property is not found
 * @returns A detail property
 *
 * @deprecated Use `createDetailProperty` instead
 */
export declare function createNextCloudFileDetailProperty(element: string, nativeType?: boolean, defaultValue?: any): import("./webdav.utils").DetailProperty<"nc", string>;
//# sourceMappingURL=helper.d.ts.map