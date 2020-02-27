"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var tag_1 = require("./tag");
// import {MultiStatusResponse} from './multiStatusResponse';
var fileProps_1 = require("./fileProps");
var errors_1 = require("../errors");
var multiStatusResponse_1 = require("./multiStatusResponse");
var NOT_FOUND = '404';
var TAG_DISPLAY_NAME = 'oc:display-name';
var PropertiesClient = /** @class */ (function () {
    function PropertiesClient(baseURL, username, password) {
        var _this = this;
        this.baseURL = baseURL;
        this.username = username;
        this.getUserFilePath = function (path) { return "files/" + _this.username + path; };
        this.getFileId = function (path) { return __awaiter(_this, void 0, void 0, function () {
            var fileprops, fileId, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getFileProps(path)];
                    case 1:
                        fileprops = _a.sent();
                        fileId = fileprops.getProperty('oc:fileid');
                        return [2 /*return*/, fileId];
                    case 2:
                        error_1 = _a.sent();
                        if (error_1 instanceof errors_1.NotFoundError) {
                            return [2 /*return*/];
                        }
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.addTag = function (fileId, tag) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.request({
                            method: 'PUT',
                            url: "/systemtags-relations/files/" + fileId + "/" + tag.id,
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.removeTag = function (fileId, tag) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.request({
                            method: 'DELETE',
                            url: "/systemtags-relations/files/" + fileId + "/" + tag.id,
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.getTags = function (fileId) { return __awaiter(_this, void 0, void 0, function () {
            var url, responses;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "/systemtags-relations/files/" + fileId;
                        return [4 /*yield*/, this.callPropFind(url, ['oc:display-name', 'oc:id'])];
                    case 1:
                        responses = _a.sent();
                        return [2 /*return*/, responses.reduce(function (carry, item) {
                                if (item.propStat.length === 0 ||
                                    item.propStat[0].status !== 'HTTP/1.1 200 OK') {
                                    return carry;
                                }
                                var tag = new tag_1.Tag(item.propStat[0].properties['oc:id'], item.propStat[0].properties['oc:display-name']);
                                carry.push(tag);
                                return carry;
                            }, [])];
                }
            });
        }); };
        this.getFileProps = function (path, names) {
            if (names === void 0) { names = [
                'd:getlastmodified',
                'd:getetag',
                'd:getcontenttype',
                'd:resourcetype',
                'oc:fileid',
                'oc:permissions',
                'oc:size',
                'd:getcontentlength',
                'nc:has-preview',
                'nc:mount-type',
                'nc:is-encrypted',
                'ocs:share-permissions',
                'oc:tags',
                'oc:favorite',
                'oc:comments-unread',
                'oc:owner-id',
                'oc:owner-display-name',
                'oc:share-types',
                'oc:share-types',
                'oc:foreign-id',
            ]; }
            return __awaiter(_this, void 0, void 0, function () {
                var absolutePath, responses, response, props;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            absolutePath = this.getUserFilePath(path);
                            return [4 /*yield*/, this.callPropFind(absolutePath, names)];
                        case 1:
                            responses = _a.sent();
                            response = responses[0];
                            if (response.propStat.length === 0 ||
                                response.propStat[0].status !== 'HTTP/1.1 200 OK') {
                                throw new errors_1.NotFoundError(absolutePath);
                            }
                            props = Object.keys(response.propStat[0].properties).reduce(function (carry, key) {
                                var name = key.replace('{http://owncloud.org/ns}', '');
                                carry[name] = response.propStat[0].properties[key];
                                return carry;
                            }, {});
                            return [2 /*return*/, new fileProps_1.FileProps(absolutePath, props)];
                    }
                });
            });
        };
        this.saveProps = function (fileProps) { return __awaiter(_this, void 0, void 0, function () {
            var rawResponse, responses, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.request({
                            // @ts-ignore axios doesn't have PROPPATCH method
                            method: 'PROPPATCH',
                            url: fileProps.path,
                            data: "<?xml version=\"1.0\"?>\n            <d:propertyupdate  xmlns:d=\"DAV:\" xmlns:oc=\"http://owncloud.org/ns\">\n            " + fileProps
                                .dirty()
                                .map(
                            // tslint:disable-next-line
                            function (prop) { return "<d:set>\n              <d:prop>\n                <" + prop.name + ">" + prop.value + "</" + prop.name + ">\n              </d:prop>\n            </d:set>"; })
                                .join('') + "</d:propertyupdate>",
                        })];
                    case 1:
                        rawResponse = _a.sent();
                        responses = this.parseMultiStatus(rawResponse.data);
                        response = responses[0];
                        if (response.propStat.length === 0 ||
                            response.propStat[0].status !== 'HTTP/1.1 200 OK') {
                            throw new Error("Can't update properties of file " + fileProps.path + ". " + response.propStat[0].status);
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        this.callPropFind = function (path, names) { return __awaiter(_this, void 0, void 0, function () {
            var rawResponse, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.connection.request({
                                // @ts-ignore axios doesn't have PROPFIND method
                                method: 'PROPFIND',
                                url: path,
                                data: "<?xml version=\"1.0\"?>\n\t\t\t\t<d:propfind  xmlns:d=\"DAV:\"\n\t\t\t\t\txmlns:oc=\"http://owncloud.org/ns\"\n\t\t\t\t\txmlns:nc=\"http://nextcloud.org/ns\"\n\t\t\t\t\txmlns:ocs=\"http://open-collaboration-services.org/ns\">\n                <d:prop>\n                    " + 
                                // tslint:disable-next-line
                                names.map(function (name) { return "<" + name + " />"; }).join('') + "\n\t\t\t\t</d:prop>\n\t\t\t\t</d:propfind>",
                            })];
                    case 1:
                        rawResponse = _a.sent();
                        return [2 /*return*/, this.parseMultiStatus(rawResponse.data)];
                    case 2:
                        err_1 = _a.sent();
                        if (err_1 && err_1.response && err_1.response.status === 404) {
                            throw new errors_1.NotFoundError(path);
                        }
                        throw err_1;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.createTag = function (name) { return __awaiter(_this, void 0, void 0, function () {
            var response, url, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.request({
                            method: 'POST',
                            url: '/systemtags',
                            data: {
                                name: name,
                                userVisible: true,
                                userAssignable: true,
                                canAssign: true,
                            },
                        })];
                    case 1:
                        response = _a.sent();
                        url = response.headers['content-location'];
                        id = this.parseIdFromLocation(url);
                        return [2 /*return*/, new tag_1.Tag(id, name)];
                }
            });
        }); };
        this.getTag = function (tagId) { return __awaiter(_this, void 0, void 0, function () {
            var response, tagName, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.callPropFind("/systemtags/" + tagId, [TAG_DISPLAY_NAME])];
                    case 1:
                        response = _a.sent();
                        if (response.length < 1) {
                            return [2 /*return*/];
                        }
                        if (response[0].propStat.length < 1) {
                            return [2 /*return*/];
                        }
                        if (!response[0].propStat[0].status) {
                            return [2 /*return*/];
                        }
                        if (response[0].propStat[0].status.includes(NOT_FOUND)) {
                            return [2 /*return*/];
                        }
                        if (!response[0].propStat[0].properties) {
                            return [2 /*return*/];
                        }
                        if (!response[0].propStat[0].properties[TAG_DISPLAY_NAME]) {
                            return [2 /*return*/];
                        }
                        tagName = response[0].propStat[0].properties[TAG_DISPLAY_NAME];
                        return [2 /*return*/, new tag_1.Tag(tagId, tagName)];
                    case 2:
                        err_2 = _a.sent();
                        console.error(err_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.getAllTags = function () { return __awaiter(_this, void 0, void 0, function () {
            var resp, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.callPropFind('/systemtags/', [])];
                    case 1:
                        resp = _a.sent();
                        result = [];
                        return [4 /*yield*/, Promise.all(resp.map(function (tagProp) { return __awaiter(_this, void 0, void 0, function () {
                                var tagId, _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            tagId = this.parseIdFromLocation(tagProp.href);
                                            if (!(tagId !== 'systemtags')) return [3 /*break*/, 2];
                                            _b = (_a = result).push;
                                            return [4 /*yield*/, this.getTag(this.parseIdFromLocation(tagProp.href))];
                                        case 1:
                                            _b.apply(_a, [_c.sent()]);
                                            _c.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); };
        this.deleteTag = function (tag) { return __awaiter(_this, void 0, void 0, function () {
            var response, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.connection.request({
                                method: 'DELETE',
                                url: "/systemtags/" + tag.id
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        err_3 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.parseIdFromLocation = function (url) {
            var queryPos = url.indexOf('?');
            var cleanUrl = url;
            if (queryPos > 0) {
                cleanUrl = url.substr(0, queryPos);
            }
            var parts = url.split('/');
            var result;
            do {
                result = parts[parts.length - 1];
                parts.pop();
            } while (!result && parts.length > 0);
            return result;
        };
        this.parseMultiStatus = function (doc) {
            return multiStatusResponse_1.MultiStatusResponse.fromString(doc);
        };
        var auth = {
            username: username,
            password: password,
        };
        var config = {
            auth: auth,
            baseURL: baseURL + "/remote.php/dav/"
            // headers: { Authorization: `Bearer ${token}` },
        };
        this.connection = axios_1.default.create(config);
    }
    return PropertiesClient;
}());
exports.PropertiesClient = PropertiesClient;
//# sourceMappingURL=PropertiesClient.js.map