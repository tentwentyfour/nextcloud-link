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
var util_1 = require("util");
var Webdav = require("webdav-client");
var helper_1 = require("./helper");
var errors_1 = require("./errors");
var sanitizePath = encodeURI;
var promisifiedPut = util_1.promisify(Webdav.Connection.prototype.put);
var promisifiedGet = util_1.promisify(Webdav.Connection.prototype.get);
var promisifiedMove = util_1.promisify(Webdav.Connection.prototype.move);
var promisifiedMkdir = util_1.promisify(Webdav.Connection.prototype.mkdir);
var promisifiedExists = util_1.promisify(Webdav.Connection.prototype.exists);
var promisifiedDelete = util_1.promisify(Webdav.Connection.prototype.delete);
var promisifiedReaddir = util_1.promisify(Webdav.Connection.prototype.readdir);
var promisifiedPreStream = util_1.promisify(Webdav.Connection.prototype.prepareForStreaming);
var promisifiedGetProperties = util_1.promisify(Webdav.Connection.prototype.getProperties);
var promisifiedSetProperties = util_1.promisify(Webdav.Connection.prototype.setProperties);
function rawGetReadStream(sanePath) {
    return __awaiter(this, void 0, void 0, function () {
        var self;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this;
                    return [4 /*yield*/, promisifiedPreStream.call(self.webdavConnection, sanePath)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, self.webdavConnection.get(sanePath)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function rawRemove(sanePath) {
    return __awaiter(this, void 0, void 0, function () {
        var self;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this;
                    return [4 /*yield*/, promisifiedDelete.call(self.webdavConnection, sanePath)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function rawExists(sanePath) {
    return __awaiter(this, void 0, void 0, function () {
        var self, paths, _i, paths_1, sanePath_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this;
                    paths = unnest(sanePath);
                    _i = 0, paths_1 = paths;
                    _a.label = 1;
                case 1:
                    if (!(_i < paths_1.length)) return [3 /*break*/, 4];
                    sanePath_1 = paths_1[_i];
                    return [4 /*yield*/, promisifiedExists.call(self.webdavConnection, sanePath_1)];
                case 2:
                    if (!(_a.sent())) {
                        return [2 /*return*/, false];
                    }
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, true];
            }
        });
    });
}
function rawPut(sanePath, content) {
    return __awaiter(this, void 0, void 0, function () {
        var self;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this;
                    return [4 /*yield*/, promisifiedPut.call(self.webdavConnection, sanePath, content)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function rawGet(sanePath) {
    return __awaiter(this, void 0, void 0, function () {
        var self;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this;
                    return [4 /*yield*/, promisifiedGet.call(self.webdavConnection, sanePath)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function rawGetFiles(sanePath) {
    return __awaiter(this, void 0, void 0, function () {
        var self, files;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this;
                    return [4 /*yield*/, promisifiedReaddir.call(self.webdavConnection, sanePath)];
                case 1:
                    files = _a.sent();
                    if (!Array.isArray(files)) {
                        throw new errors_1.NotReadyError;
                    }
                    return [2 /*return*/, files];
            }
        });
    });
}
function rawGetFolderFileDetails(sanePath, extraProperties) {
    return __awaiter(this, void 0, void 0, function () {
        var self, options, files;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this;
                    options = {
                        properties: true
                    };
                    if (extraProperties && extraProperties.length > 0) {
                        options['extraProperties'] = extraProperties.slice();
                    }
                    return [4 /*yield*/, promisifiedReaddir.call(self.webdavConnection, sanePath, options)];
                case 1:
                    files = _a.sent();
                    if (!Array.isArray(files)) {
                        throw new errors_1.NotReadyError;
                    }
                    return [2 /*return*/, files];
            }
        });
    });
}
function rawGetFolderProperties(sanePath, extraProperties) {
    return __awaiter(this, void 0, void 0, function () {
        var self, options, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this;
                    options = {
                        properties: true
                    };
                    if (extraProperties && extraProperties.length > 0) {
                        options['extraProperties'] = extraProperties.slice();
                    }
                    return [4 /*yield*/, promisifiedGetProperties.call(self.webdavConnection, sanePath, options)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
function rawSetFolderProperties(sanePath, properties) {
    return __awaiter(this, void 0, void 0, function () {
        var self, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this;
                    return [4 /*yield*/, promisifiedSetProperties.call(self.webdavConnection, sanePath, properties)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
function rawRename(saneFrom, newName) {
    return __awaiter(this, void 0, void 0, function () {
        var self, override, base, fullDestinationPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this;
                    override = true;
                    base = saneFrom.slice(0, saneFrom.lastIndexOf('/') + 1);
                    fullDestinationPath = "" + nextcloudRoot(self.url, self.username) + base + sanitizePath(newName);
                    return [4 /*yield*/, promisifiedMove.call(self.webdavConnection, saneFrom, fullDestinationPath, override)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function rawMove(saneFrom, toPath) {
    return __awaiter(this, void 0, void 0, function () {
        var self, fullDestinationPath, override;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this;
                    fullDestinationPath = "" + nextcloudRoot(self.url, self.username) + sanitizePath(toPath);
                    override = true;
                    return [4 /*yield*/, promisifiedMove.call(self.webdavConnection, saneFrom, fullDestinationPath, override)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function rawGetWriteStream(sanePath) {
    return __awaiter(this, void 0, void 0, function () {
        var self;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this;
                    return [4 /*yield*/, preWriteStream.call(self, sanePath)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, self.webdavConnection.put(sanePath)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function rawTouchFolder(sanePath) {
    return __awaiter(this, void 0, void 0, function () {
        var self;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this;
                    return [4 /*yield*/, rawExists.call(self, sanePath)];
                case 1:
                    if (!!(_a.sent())) return [3 /*break*/, 3];
                    return [4 /*yield*/, promisifiedMkdir.call(self.webdavConnection, sanePath)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function rawCreateFolderHierarchy(sanePath) {
    return __awaiter(this, void 0, void 0, function () {
        var self, paths, _i, paths_2, saneSubfolder;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this;
                    paths = unnest(sanePath);
                    _i = 0, paths_2 = paths;
                    _a.label = 1;
                case 1:
                    if (!(_i < paths_2.length)) return [3 /*break*/, 4];
                    saneSubfolder = paths_2[_i];
                    return [4 /*yield*/, rawTouchFolder.call(self, saneSubfolder)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function configureWebdavConnection(options) {
    var self = this;
    self.webdavConnection = new Webdav.Connection({
        url: nextcloudRoot(options.url, options.username),
        authenticator: new Webdav.BasicAuthenticator(),
        username: options.username,
        password: options.password
    });
}
exports.configureWebdavConnection = configureWebdavConnection;
function checkConnectivity() {
    return __awaiter(this, void 0, void 0, function () {
        var self, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, rawGetFiles.call(self, '/')];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/, true];
            }
        });
    });
}
exports.checkConnectivity = checkConnectivity;
function rawPipeStream(sanePath, stream) {
    return __awaiter(this, void 0, void 0, function () {
        var self, writeStream;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this;
                    return [4 /*yield*/, rawGetWriteStream.call(self, sanePath)];
                case 1:
                    writeStream = _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            stream.on('error', wrapError);
                            writeStream.on('end', resolve);
                            writeStream.on('error', wrapError);
                            stream.pipe(writeStream);
                            function wrapError(error) {
                                reject(errors_1.Exception(error));
                            }
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createFolderHierarchy = helper_1.clientFunction(rawCreateFolderHierarchy);
exports.getFolderFileDetails = helper_1.clientFunction(rawGetFolderFileDetails);
exports.getFolderProperties = helper_1.clientFunction(rawGetFolderProperties);
exports.setFolderProperties = helper_1.clientFunction(rawSetFolderProperties);
exports.getWriteStream = helper_1.clientFunction(rawGetWriteStream);
exports.getReadStream = helper_1.clientFunction(rawGetReadStream);
exports.touchFolder = helper_1.clientFunction(rawTouchFolder);
exports.pipeStream = helper_1.clientFunction(rawPipeStream);
exports.getFiles = helper_1.clientFunction(rawGetFiles);
exports.rename = helper_1.clientFunction(rawRename);
exports.remove = helper_1.clientFunction(rawRemove);
exports.move = helper_1.clientFunction(rawMove);
exports.exists = helper_1.clientFunction(rawExists);
exports.put = helper_1.clientFunction(rawPut);
exports.get = helper_1.clientFunction(rawGet);
function preWriteStream(sanitizedPath) {
    return __awaiter(this, void 0, void 0, function () {
        var self;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this;
                    return [4 /*yield*/, promisifiedPut.call(self.webdavConnection, sanitizedPath, '')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, promisifiedPreStream.call(self.webdavConnection, sanitizedPath)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function unnest(path) {
    return path
        .slice(1)
        .split('/')
        .map(function (folder, position, folders) { return "/" + folders.slice(0, position + 1).join('/'); });
}
function nextcloudRoot(url, username) {
    var lastUrlCharacterIsSlash = url.slice(-1)[0] === '/';
    var terminatedUrl = lastUrlCharacterIsSlash ? url : url + "/";
    return terminatedUrl + "remote.php/dav/files/" + username;
}
//# sourceMappingURL=webdav.js.map