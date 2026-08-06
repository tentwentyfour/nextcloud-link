export var OcsShareType;
(function (OcsShareType) {
    OcsShareType[OcsShareType["user"] = 0] = "user";
    OcsShareType[OcsShareType["group"] = 1] = "group";
    OcsShareType[OcsShareType["publicLink"] = 3] = "publicLink";
    OcsShareType[OcsShareType["federatedCloudShare"] = 6] = "federatedCloudShare";
})(OcsShareType || (OcsShareType = {}));
export var OcsSharePermissions;
(function (OcsSharePermissions) {
    OcsSharePermissions[OcsSharePermissions["default"] = -1] = "default";
    OcsSharePermissions[OcsSharePermissions["read"] = 1] = "read";
    OcsSharePermissions[OcsSharePermissions["update"] = 2] = "update";
    OcsSharePermissions[OcsSharePermissions["create"] = 4] = "create";
    OcsSharePermissions[OcsSharePermissions["delete"] = 8] = "delete";
    OcsSharePermissions[OcsSharePermissions["share"] = 16] = "share";
    OcsSharePermissions[OcsSharePermissions["all"] = 31] = "all";
})(OcsSharePermissions || (OcsSharePermissions = {}));
