"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileDetailsToXMLString = exports.createDetailProperty = void 0;
const errors_1 = require("./errors");
const NAMESPACES = [
    {
        short: "d",
        full: "DAV:",
        elements: [
            "creationdate",
            "getlastmodified",
            "getetag",
            "getcontenttype",
            "resourcetype",
            "getcontentlength",
            "getcontentlanguage",
            "displayname",
            "lockdiscovery",
            "supportedlock",
        ]
    },
    {
        short: "oc",
        full: "http://owncloud.org/ns",
        elements: [
            "id",
            "fileid",
            "downloadURL",
            "permissions",
            "size",
            "quota-used-bytes",
            "quota-available-bytes",
            "tags",
            "favorite",
            "comments-href",
            "comments-count",
            "comments-unread",
            "owner-id",
            "owner-display-name",
            "share-types",
            "checksums",
            "has-preview",
            "rich-workspace-file",
            "rich-workspace",
        ]
    },
    {
        short: "nc",
        full: "http://nextcloud.org/ns",
        elements: [
            "creation_time",
            "mount-type",
            "is-encrypted",
            "share-attributes",
            "sharees",
            "share-permissions",
            "acl-enabled",
            "acl-can-manage",
            "acl-list",
            "inherited-acl-list",
            "group-folder-id",
            "lock",
            "lock-owner-type",
            "lock-owner",
            "lock-owner-displayname",
            "lock-owner-editor",
            "lock-time",
            "lock-timeout",
            "lock-token",
            "contained-folder-count",
            "contained-file-count",
            "data-fingerprint",
            "upload_time",
            "note",
        ]
    },
    {
        short: "ocs",
        full: "http://open-collaboration-services.org/ns",
        elements: [
            "share-permissions",
        ]
    },
    {
        short: "ocm",
        full: "http://open-cloud-mesh.org/ns",
        elements: [
            "share-permissions",
        ]
    },
];
const SHORT_CODE_TO_NAMESPACE = NAMESPACES
    .reduce((acc, namespace) => {
    acc[namespace.short] = namespace;
    return acc;
}, {});
function createDetailProperty(namespace, element, defaultValue) {
    if (!SHORT_CODE_TO_NAMESPACE[namespace]) {
        throw new errors_1.BadArgumentError(`Unknown namespace shortcode: ${namespace}`);
    }
    return {
        namespaceShort: namespace,
        namespace: SHORT_CODE_TO_NAMESPACE[namespace].full,
        element,
        default: defaultValue
    };
}
exports.createDetailProperty = createDetailProperty;
function fileDetailsToXMLString(details) {
    const namespaces = [
        ...new Set(details
            .map(detail => detail.namespaceShort)
            .concat('d'))
    ]
        .map(short => `xmlns:${short}="${SHORT_CODE_TO_NAMESPACE[short].full}"`);
    const elements = details.map(detail => `<${detail.namespaceShort}:${detail.element} />`);
    return `<?xml version="1.0" encoding="UTF-8"?><d:propfind ${namespaces.join(' ')}><d:prop>${elements.join('\n')}</d:prop></d:propfind>`;
}
exports.fileDetailsToXMLString = fileDetailsToXMLString;
