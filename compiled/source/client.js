"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var webdav_1 = require("./webdav");
var common_1 = require("./common");
var ocs_1 = require("./ocs/ocs");
var types_1 = require("./types");
var NextcloudClient = /** @class */ (function (_super) {
    __extends(NextcloudClient, _super);
    function NextcloudClient(options) {
        var _this = _super.call(this) || this;
        _this.configureWebdavConnection = webdav_1.configureWebdavConnection;
        _this.configureOcsConnection = ocs_1.configureOcsConnection;
        _this.createFolderHierarchy = webdav_1.createFolderHierarchy;
        _this.getFolderFileDetails = webdav_1.getFolderFileDetails;
        _this.getFolderProperties = webdav_1.getFolderProperties;
        _this.setFolderProperties = webdav_1.setFolderProperties;
        _this.checkConnectivity = webdav_1.checkConnectivity;
        _this.getWriteStream = webdav_1.getWriteStream;
        _this.getReadStream = webdav_1.getReadStream;
        _this.touchFolder = webdav_1.touchFolder;
        _this.pipeStream = webdav_1.pipeStream;
        _this.getFiles = webdav_1.getFiles;
        _this.rename = webdav_1.rename;
        _this.remove = webdav_1.remove;
        _this.exists = webdav_1.exists;
        _this.move = webdav_1.move;
        _this.put = webdav_1.put;
        _this.get = webdav_1.get;
        // Common
        _this.getCreatorByFileId = common_1.getCreatorByFileId;
        _this.getCreatorByPath = common_1.getCreatorByPath;
        // OCS
        _this.activities = {
            get: function (fileId, sort, limit, sinceActivityId) { return ocs_1.getActivities(_this.ocsConnection, fileId, sort, limit, sinceActivityId); }
        };
        _this.users = {
            removeSubAdminFromGroup: function (userId, groupId) { return ocs_1.addRemoveUserSubAdminForGroup(_this.ocsConnection, userId, groupId, false); },
            addSubAdminToGroup: function (userId, groupId) { return ocs_1.addRemoveUserSubAdminForGroup(_this.ocsConnection, userId, groupId, true); },
            resendWelcomeEmail: function (userId) { return ocs_1.resendUserWelcomeEmail(_this.ocsConnection, userId); },
            getSubAdminGroups: function (userId) { return ocs_1.getUserSubAdmins(_this.ocsConnection, userId); },
            removeFromGroup: function (userId, groupId) { return ocs_1.addRemoveUserForGroup(_this.ocsConnection, userId, groupId, false); },
            setEnabled: function (userId, isEnabled) { return ocs_1.setUserEnabled(_this.ocsConnection, userId, isEnabled); },
            addToGroup: function (userId, groupId) { return ocs_1.addRemoveUserForGroup(_this.ocsConnection, userId, groupId, true); },
            getGroups: function (userId) { return ocs_1.getUserGroups(_this.ocsConnection, userId); },
            delete: function (userId) { return ocs_1.deleteUser(_this.ocsConnection, userId); },
            edit: function (userId, field, value) { return ocs_1.editUser(_this.ocsConnection, userId, field, value); },
            list: function (search, limit, offset) { return ocs_1.listUsers(_this.ocsConnection, search, limit, offset); },
            add: function (user) { return ocs_1.addUser(_this.ocsConnection, user); },
            get: function (userId) { return ocs_1.getUser(_this.ocsConnection, userId); },
        };
        _this.groups = {
            getSubAdmins: function (groupId) { return ocs_1.getGroupSubAdmins(_this.ocsConnection, groupId); },
            getUsers: function (groupId) { return ocs_1.getGroupUsers(_this.ocsConnection, groupId); },
            delete: function (groupId) { return ocs_1.deleteGroup(_this.ocsConnection, groupId); },
            list: function (search, limit, offset) { return ocs_1.listGroups(_this.ocsConnection, search, limit, offset); },
            add: function (groupId) { return ocs_1.addGroup(_this.ocsConnection, groupId); },
        };
        _this.shares = {
            delete: function (shareId) { return ocs_1.deleteShare(_this.ocsConnection, shareId); },
            edit: {
                permissions: function (shareId, permissions) { return ocs_1.editShare(_this.ocsConnection, shareId).permissions(permissions); },
                password: function (shareId, password) { return ocs_1.editShare(_this.ocsConnection, shareId).password(password); },
                publicUpload: function (shareId, isPublicUpload) { return ocs_1.editShare(_this.ocsConnection, shareId).publicUpload(isPublicUpload); },
                expireDate: function (shareId, expireDate) { return ocs_1.editShare(_this.ocsConnection, shareId).expireDate(expireDate); },
                note: function (shareId, note) { return ocs_1.editShare(_this.ocsConnection, shareId).note(note); },
            },
            list: function (path, includeReshares, showForSubFiles) { return ocs_1.getShares(_this.ocsConnection, path, includeReshares, showForSubFiles); },
            add: function (path, shareType, shareWith, permissions, password, publicUpload) { return ocs_1.addShare(_this.ocsConnection, path, shareType, shareWith, permissions, password, publicUpload); },
            get: function (shareId) { return ocs_1.getShare(_this.ocsConnection, shareId); },
        };
        _this.username = options.username;
        _this.url = options.url.endsWith('/') ? options.url.slice(0, -1) : options.url;
        _this.configureWebdavConnection(options);
        _this.configureOcsConnection(options);
        return _this;
    }
    NextcloudClient.prototype.as = function (username, password) {
        return new NextcloudClient({ username: username, password: password, url: this.url });
    };
    return NextcloudClient;
}(types_1.NextcloudClientProperties));
exports.NextcloudClient = NextcloudClient;
//# sourceMappingURL=client.js.map