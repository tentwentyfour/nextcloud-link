"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcsSharePermissions = exports.OcsShareType = void 0;
var OcsShareType;
(function (OcsShareType) {
    OcsShareType[OcsShareType["user"] = 0] = "user";
    OcsShareType[OcsShareType["group"] = 1] = "group";
    OcsShareType[OcsShareType["publicLink"] = 3] = "publicLink";
    OcsShareType[OcsShareType["federatedCloudShare"] = 6] = "federatedCloudShare";
})(OcsShareType = exports.OcsShareType || (exports.OcsShareType = {}));
var OcsSharePermissions;
(function (OcsSharePermissions) {
    OcsSharePermissions[OcsSharePermissions["default"] = -1] = "default";
    OcsSharePermissions[OcsSharePermissions["read"] = 1] = "read";
    OcsSharePermissions[OcsSharePermissions["update"] = 2] = "update";
    OcsSharePermissions[OcsSharePermissions["create"] = 4] = "create";
    OcsSharePermissions[OcsSharePermissions["delete"] = 8] = "delete";
    OcsSharePermissions[OcsSharePermissions["share"] = 16] = "share";
    OcsSharePermissions[OcsSharePermissions["all"] = 31] = "all";
})(OcsSharePermissions = exports.OcsSharePermissions || (exports.OcsSharePermissions = {}));
