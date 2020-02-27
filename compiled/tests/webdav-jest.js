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
var errors_1 = require("../source/errors");
var client_1 = require("../source/client");
var configuration_1 = require("./configuration");
var Stream = require("stream");
var path_1 = require("path");
var helper_1 = require("../source/helper");
var types_1 = require("../source/ocs/types");
// handle unhandled exception and print out better stacktrace
process.on('unhandledRejection', function (reason, promise) {
    console.warn('Unhandled promise rejection:', promise);
    // console.warn('Unhandled promise rejection:', promise, 'reason:', reason)
});
jest.setTimeout(20000);
describe('Webdav integration', function testWebdavIntegration() {
    var _this = this;
    console.log('config:', configuration_1.default.connectionOptions);
    var client = new client_1.NextcloudClient(configuration_1.default.connectionOptions);
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        var files, tags;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.getFiles('/')];
                case 1:
                    files = _a.sent();
                    return [4 /*yield*/, Promise.all(files.map(function (file) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, client.remove("/" + file)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        }))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, client.properties.getAllTags()];
                case 3:
                    tags = _a.sent();
                    return [4 /*yield*/, Promise.all(tags.map(function (tag) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, client.properties.deleteTag(tag)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('Properties integration', function testPropertiesIntegration() {
        var _this = this;
        it('should return a file id', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, string, _a, _b, fileId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        path = randomRootPath();
                        string = 'test';
                        _a = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 1:
                        _a.apply(void 0, [_c.sent()]).toBe(false);
                        return [4 /*yield*/, client.put(path, string)];
                    case 2:
                        _c.sent();
                        _b = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 3:
                        _b.apply(void 0, [_c.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.properties.getFileId(path)];
                    case 4:
                        fileId = _c.sent();
                        expect(fileId).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('can get invalid fileid', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, fileId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = randomRootPath();
                        return [4 /*yield*/, client.properties.getFileId(path)];
                    case 1:
                        fileId = _a.sent();
                        expect(fileId).toBeUndefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should be possible to create a tag', function () { return __awaiter(_this, void 0, void 0, function () {
            var tag;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.properties.createTag('somessTag')];
                    case 1:
                        tag = _a.sent();
                        expect(tag).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should be possible to get all tags', function () { return __awaiter(_this, void 0, void 0, function () {
            var tag1, tag2, tags;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.properties.createTag('new,jkkTkkag')];
                    case 1:
                        tag1 = _a.sent();
                        return [4 /*yield*/, client.properties.createTag('secondTag')];
                    case 2:
                        tag2 = _a.sent();
                        return [4 /*yield*/, client.properties.getAllTags()];
                    case 3:
                        tags = _a.sent();
                        expect(tags.length).toBe(2);
                        expect(tags).toEqual(expect.arrayContaining([tag1, tag2]));
                        return [2 /*return*/];
                }
            });
        }); });
        it('can delete tags', function () { return __awaiter(_this, void 0, void 0, function () {
            var tag;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.properties.createTag('toBeDeleted')];
                    case 1:
                        tag = _a.sent();
                        return [4 /*yield*/, client.properties.deleteTag(tag)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('can delete tag again', function () { return __awaiter(_this, void 0, void 0, function () {
            var tag, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, client.properties.createTag('toBeDeleted')];
                    case 1:
                        tag = _c.sent();
                        _a = expect;
                        return [4 /*yield*/, client.properties.deleteTag(tag)];
                    case 2:
                        _a.apply(void 0, [_c.sent()]).toBe(true);
                        _b = expect;
                        return [4 /*yield*/, client.properties.deleteTag(tag)];
                    case 3:
                        _b.apply(void 0, [_c.sent()]).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it('can add tag to file', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, _a, _b, fileId, tag, fileTags;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        path = randomRootPath();
                        _a = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 1:
                        _a.apply(void 0, [_c.sent()]).toBe(false);
                        return [4 /*yield*/, client.put(path, '')];
                    case 2:
                        _c.sent();
                        _b = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 3:
                        _b.apply(void 0, [_c.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.properties.getFileId(path)];
                    case 4:
                        fileId = _c.sent();
                        if (!fileId) return [3 /*break*/, 8];
                        return [4 /*yield*/, client.properties.createTag('someTag')];
                    case 5:
                        tag = _c.sent();
                        return [4 /*yield*/, client.properties.addTag(fileId, tag)];
                    case 6:
                        _c.sent();
                        return [4 /*yield*/, client.properties.getTags(fileId)];
                    case 7:
                        fileTags = _c.sent();
                        expect(fileTags.length).toBe(1);
                        expect(fileTags[0]).toEqual(tag);
                        return [3 /*break*/, 9];
                    case 8:
                        fail('no fileid');
                        _c.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        }); });
        it('can remove tag from file', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, _a, _b, fileId, tag, fileTags, fileTagsAfterDelete;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        path = randomRootPath();
                        _a = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 1:
                        _a.apply(void 0, [_c.sent()]).toBe(false);
                        return [4 /*yield*/, client.put(path, '')];
                    case 2:
                        _c.sent();
                        _b = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 3:
                        _b.apply(void 0, [_c.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.properties.getFileId(path)];
                    case 4:
                        fileId = _c.sent();
                        if (!fileId) return [3 /*break*/, 10];
                        return [4 /*yield*/, client.properties.createTag('someTag')];
                    case 5:
                        tag = _c.sent();
                        return [4 /*yield*/, client.properties.addTag(fileId, tag)];
                    case 6:
                        _c.sent();
                        return [4 /*yield*/, client.properties.getTags(fileId)];
                    case 7:
                        fileTags = _c.sent();
                        expect(fileTags.length).toBe(1);
                        return [4 /*yield*/, client.properties.removeTag(fileId, tag)];
                    case 8:
                        _c.sent();
                        return [4 /*yield*/, client.properties.getTags(fileId)];
                    case 9:
                        fileTagsAfterDelete = _c.sent();
                        expect(fileTagsAfterDelete.length).toBe(0);
                        return [3 /*break*/, 11];
                    case 10:
                        fail('no fileid');
                        _c.label = 11;
                    case 11: return [2 /*return*/];
                }
            });
        }); });
        it('can delete used tag', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, _a, _b, fileId, tag, fileTagsAfterDeleteTag;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        path = randomRootPath();
                        _a = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 1:
                        _a.apply(void 0, [_c.sent()]).toBe(false);
                        return [4 /*yield*/, client.put(path, '')];
                    case 2:
                        _c.sent();
                        _b = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 3:
                        _b.apply(void 0, [_c.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.properties.getFileId(path)];
                    case 4:
                        fileId = _c.sent();
                        if (!fileId) return [3 /*break*/, 9];
                        return [4 /*yield*/, client.properties.createTag('someTag')];
                    case 5:
                        tag = _c.sent();
                        return [4 /*yield*/, client.properties.addTag(fileId, tag)];
                    case 6:
                        _c.sent();
                        return [4 /*yield*/, client.properties.deleteTag(tag)];
                    case 7:
                        _c.sent();
                        return [4 /*yield*/, client.properties.getTags(fileId)];
                    case 8:
                        fileTagsAfterDeleteTag = _c.sent();
                        expect(fileTagsAfterDeleteTag.length).toBe(0);
                        return [3 /*break*/, 10];
                    case 9:
                        fail('no fileid');
                        _c.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        }); });
    });
    describe('checkConnectivity()', function () {
        it('should return false if there is no connectivity', function () { return __awaiter(_this, void 0, void 0, function () {
            var badClient, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        badClient = new client_1.NextcloudClient(Object.assign({}, configuration_1.default, {
                            url: 'http://127.0.0.1:65530'
                        }));
                        _a = expect;
                        return [4 /*yield*/, client.checkConnectivity()];
                    case 1:
                        _a.apply(void 0, [_c.sent()]).toBeTruthy();
                        _b = expect;
                        return [4 /*yield*/, badClient.checkConnectivity()];
                    case 2:
                        _b.apply(void 0, [_c.sent()]).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('exists(path)', function () {
        it('should return true if the given resource exists, false otherwise', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        path = randomRootPath();
                        _a = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 1:
                        _a.apply(void 0, [_c.sent()]).toBe(false);
                        return [4 /*yield*/, client.put(path, '')];
                    case 2:
                        _c.sent();
                        _b = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 3:
                        _b.apply(void 0, [_c.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.remove(path)];
                    case 4:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should not crash for nested folders', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        path = "" + randomRootPath() + randomRootPath();
                        _a = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 1:
                        _a.apply(void 0, [_b.sent()]).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('404s', function () {
        it('should throw 404s when a resource is not found', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, path2, nested, stream, error_1, error_2, error_3, error_4, error_5, error_6, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = randomRootPath();
                        path2 = randomRootPath();
                        nested = "" + path + path2;
                        stream = new Stream.Readable();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, client.get(path)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        expect(error_1 instanceof errors_1.NotFoundError).toBeTruthy();
                        return [3 /*break*/, 4];
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, client.getFiles(path)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        expect(error_2 instanceof errors_1.NotFoundError).toBeTruthy();
                        return [3 /*break*/, 7];
                    case 7:
                        _a.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, client.put(nested, '')];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        error_3 = _a.sent();
                        expect(error_3 instanceof errors_1.NotFoundError).toBeTruthy();
                        return [3 /*break*/, 10];
                    case 10:
                        _a.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, client.rename(path, path2)];
                    case 11:
                        _a.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        error_4 = _a.sent();
                        expect(error_4 instanceof errors_1.NotFoundError).toBeTruthy();
                        return [3 /*break*/, 13];
                    case 13:
                        _a.trys.push([13, 15, , 16]);
                        return [4 /*yield*/, client.getReadStream(path)];
                    case 14:
                        _a.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        error_5 = _a.sent();
                        expect(error_5 instanceof errors_1.NotFoundError).toBeTruthy();
                        return [3 /*break*/, 16];
                    case 16:
                        _a.trys.push([16, 18, , 19]);
                        return [4 /*yield*/, client.getWriteStream(nested)];
                    case 17:
                        _a.sent();
                        return [3 /*break*/, 19];
                    case 18:
                        error_6 = _a.sent();
                        expect(error_6 instanceof errors_1.NotFoundError).toBeTruthy();
                        return [3 /*break*/, 19];
                    case 19:
                        _a.trys.push([19, 21, , 22]);
                        return [4 /*yield*/, client.pipeStream(nested, stream)];
                    case 20:
                        _a.sent();
                        return [3 /*break*/, 22];
                    case 21:
                        error_7 = _a.sent();
                        expect(error_7 instanceof errors_1.NotFoundError).toBeTruthy();
                        return [3 /*break*/, 22];
                    case 22: return [2 /*return*/];
                }
            });
        }); });
    });
    describe('put & get', function () {
        it('should allow to save and get files without streaming', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, string, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        path = randomRootPath();
                        string = 'test';
                        _a = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 1:
                        _a.apply(void 0, [_c.sent()]).toBe(false);
                        return [4 /*yield*/, client.put(path, string)];
                    case 2:
                        _c.sent();
                        _b = expect;
                        return [4 /*yield*/, client.get(path)];
                    case 3:
                        _b.apply(void 0, [(_c.sent()).toString()]).toBe(string);
                        return [4 /*yield*/, client.remove(path)];
                    case 4:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should save a Buffer and get the file without streaming', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, string, buffer, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        path = randomRootPath();
                        string = 'tėŠt àáâèéî';
                        buffer = Buffer.from(string);
                        _a = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 1:
                        _a.apply(void 0, [_c.sent()]).toBe(false);
                        return [4 /*yield*/, client.put(path, buffer)];
                    case 2:
                        _c.sent();
                        _b = expect;
                        return [4 /*yield*/, client.get(path)];
                    case 3:
                        _b.apply(void 0, [(_c.sent()).toString()]).toBe(string);
                        return [4 /*yield*/, client.remove(path)];
                    case 4:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('remove(path)', function () {
        it('should remove simple files properly', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        path = randomRootPath();
                        _a = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 1:
                        _a.apply(void 0, [_d.sent()]).toBe(false);
                        return [4 /*yield*/, client.put(path, '')];
                    case 2:
                        _d.sent();
                        _b = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 3:
                        _b.apply(void 0, [_d.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.remove(path)];
                    case 4:
                        _d.sent();
                        _c = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 5:
                        _c.apply(void 0, [_d.sent()]).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should remove folders recursively', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, file, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        path = randomRootPath();
                        file = "" + path + path;
                        return [4 /*yield*/, client.touchFolder(path)];
                    case 1:
                        _d.sent();
                        _a = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 2:
                        _a.apply(void 0, [_d.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.put(file, '')];
                    case 3:
                        _d.sent();
                        return [4 /*yield*/, client.remove(path)];
                    case 4:
                        _d.sent();
                        _b = expect;
                        return [4 /*yield*/, client.exists(file)];
                    case 5:
                        _b.apply(void 0, [_d.sent()]).toBe(false);
                        _c = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 6:
                        _c.apply(void 0, [_d.sent()]).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('touchFolder(path)', function () {
        it('should create folders', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        path = randomRootPath();
                        _a = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 1:
                        _a.apply(void 0, [_c.sent()]).toBe(false);
                        return [4 /*yield*/, client.touchFolder(path)];
                    case 2:
                        _c.sent();
                        _b = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 3:
                        _b.apply(void 0, [_c.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.remove(path)];
                    case 4:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should allow folders with spaces in their names', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        path = randomRootPath() + " test";
                        return [4 /*yield*/, client.touchFolder(path)];
                    case 1:
                        _b.sent();
                        _a = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 2:
                        _a.apply(void 0, [_b.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.remove(path)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should not complain if the folder already exists', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        path = randomRootPath() + " test";
                        return [4 /*yield*/, client.touchFolder(path)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, client.touchFolder(path)];
                    case 2:
                        _b.sent();
                        _a = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 3:
                        _a.apply(void 0, [_b.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.remove(path)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should allow folders with accented characters', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        path = randomRootPath() + " test\u00E9";
                        return [4 /*yield*/, client.touchFolder(path)];
                    case 1:
                        _b.sent();
                        _a = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 2:
                        _a.apply(void 0, [_b.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.remove(path)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getFiles(path)', function () {
        it('should retrieve lists of files in a given folder', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, fileName1, fileName2, file1, file2, _a, _b, _c, files;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        path = randomRootPath();
                        fileName1 = 'file1';
                        fileName2 = 'file2';
                        file1 = path + "/" + fileName1;
                        file2 = path + "/" + fileName2;
                        return [4 /*yield*/, client.touchFolder(path)];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, client.put(file1, '')];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, client.put(file2, '')];
                    case 3:
                        _d.sent();
                        _a = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 4:
                        _a.apply(void 0, [_d.sent()]).toBeTruthy();
                        _b = expect;
                        return [4 /*yield*/, client.exists(file1)];
                    case 5:
                        _b.apply(void 0, [_d.sent()]).toBeTruthy();
                        _c = expect;
                        return [4 /*yield*/, client.exists(file2)];
                    case 6:
                        _c.apply(void 0, [_d.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.getFiles(path)];
                    case 7:
                        files = _d.sent();
                        expect(files.length).toBe(2);
                        expect(files.includes(fileName1)).toBeTruthy();
                        expect(files.includes(fileName2)).toBeTruthy();
                        return [4 /*yield*/, client.remove(path)];
                    case 8:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getFolderFileDetails(path)', function () {
        it('should retrieve lists of files in a given folder', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, fileName1, fileName2, file1, file2, files;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = randomRootPath();
                        fileName1 = 'file1';
                        fileName2 = 'file2';
                        file1 = path + "/" + fileName1;
                        file2 = path + "/" + fileName2;
                        return [4 /*yield*/, client.touchFolder(path)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, client.touchFolder(file1)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, client.put(file2, '')];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, client.getFolderFileDetails(path)];
                    case 4:
                        files = _a.sent();
                        expect(files.length).toBe(2);
                        expect(files[0].isFile).toBeFalsy();
                        expect(files[0].name).toBe(fileName1);
                        expect(files[0].isDirectory).toBeTruthy();
                        expect(files[0].creationDate).toBeFalsy();
                        expect(files[0].lastModified).toBeTruthy();
                        expect(files[0].href).toBe("/remote.php/dav/files/nextcloud" + path + "/" + fileName1);
                        expect(files[1].isFile).toBeTruthy();
                        expect(files[1].name).toBe(fileName2);
                        expect(files[1].isDirectory).toBeFalsy();
                        expect(files[1].creationDate).toBeFalsy();
                        expect(files[1].lastModified).toBeTruthy();
                        expect(files[1].href).toBe("/remote.php/dav/files/nextcloud" + path + "/" + fileName2);
                        return [4 /*yield*/, client.remove(path)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should retrieve the properties of a folder', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, properties;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = randomRootPath();
                        return [4 /*yield*/, client.touchFolder(path)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, client.getFolderProperties(path, [
                                helper_1.createOwnCloudFileDetailProperty('fileid', true),
                                helper_1.createOwnCloudFileDetailProperty('size', true),
                                helper_1.createOwnCloudFileDetailProperty('owner-id')
                            ])];
                    case 2:
                        properties = _a.sent();
                        expect(properties['oc:owner-id'].content).toBe('nextcloud');
                        return [4 /*yield*/, client.remove(path)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('createFolderHierarchy(path)', function () {
        it('should create hierarchies properly, even when part of it already exists', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, subFolder1, subFolder2, subFolder3, subFolder1Path, subFolder2Path, subFolder3Path, _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        path = randomRootPath();
                        subFolder1 = 'sub1';
                        subFolder2 = 'sub2';
                        subFolder3 = 'sub3';
                        return [4 /*yield*/, client.touchFolder(path)];
                    case 1:
                        _e.sent();
                        subFolder1Path = path + "/" + subFolder1;
                        subFolder2Path = subFolder1Path + "/" + subFolder2;
                        subFolder3Path = subFolder2Path + "/" + subFolder3;
                        return [4 /*yield*/, client.createFolderHierarchy(subFolder3Path)];
                    case 2:
                        _e.sent();
                        _a = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 3:
                        _a.apply(void 0, [_e.sent()]).toBeTruthy();
                        _b = expect;
                        return [4 /*yield*/, client.exists(subFolder1Path)];
                    case 4:
                        _b.apply(void 0, [_e.sent()]).toBeTruthy();
                        _c = expect;
                        return [4 /*yield*/, client.exists(subFolder2Path)];
                    case 5:
                        _c.apply(void 0, [_e.sent()]).toBeTruthy();
                        _d = expect;
                        return [4 /*yield*/, client.exists(subFolder3Path)];
                    case 6:
                        _d.apply(void 0, [_e.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.remove(path)];
                    case 7:
                        _e.sent();
                        return [2 /*return*/];
                }
            });
        }); }, 10000);
    });
    describe('rename(path, newName)', function () {
        it('should work on simple files', function () { return __awaiter(_this, void 0, void 0, function () {
            var source, renamed, renamedPath, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        source = randomRootPath();
                        renamed = randomRootPath().slice(1);
                        renamedPath = "/" + renamed;
                        return [4 /*yield*/, client.put(source, '')];
                    case 1:
                        _d.sent();
                        _a = expect;
                        return [4 /*yield*/, client.exists(source)];
                    case 2:
                        _a.apply(void 0, [_d.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.rename(source, renamed)];
                    case 3:
                        _d.sent();
                        _b = expect;
                        return [4 /*yield*/, client.exists(source)];
                    case 4:
                        _b.apply(void 0, [_d.sent()]).toBe(false);
                        _c = expect;
                        return [4 /*yield*/, client.exists(renamedPath)];
                    case 5:
                        _c.apply(void 0, [_d.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.remove(renamedPath)];
                    case 6:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should work on folders too', function () { return __awaiter(_this, void 0, void 0, function () {
            var source, renamed, renamedPath, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        source = randomRootPath();
                        renamed = randomRootPath().slice(1);
                        renamedPath = "/" + renamed;
                        return [4 /*yield*/, client.touchFolder(source)];
                    case 1:
                        _d.sent();
                        _a = expect;
                        return [4 /*yield*/, client.exists(source)];
                    case 2:
                        _a.apply(void 0, [_d.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.rename(source, renamed)];
                    case 3:
                        _d.sent();
                        _b = expect;
                        return [4 /*yield*/, client.exists(source)];
                    case 4:
                        _b.apply(void 0, [_d.sent()]).toBe(false);
                        _c = expect;
                        return [4 /*yield*/, client.exists(renamedPath)];
                    case 5:
                        _c.apply(void 0, [_d.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.remove(renamedPath)];
                    case 6:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('move(path, newName)', function () {
        it('should work on simple files', function () { return __awaiter(_this, void 0, void 0, function () {
            var folder, source, renamed, renamedPath, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        folder = randomRootPath();
                        source = randomRootPath();
                        renamed = randomRootPath().slice(1);
                        renamedPath = "/" + folder + "/" + renamed;
                        return [4 /*yield*/, client.createFolderHierarchy(folder)];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, client.put(source, '')];
                    case 2:
                        _d.sent();
                        _a = expect;
                        return [4 /*yield*/, client.exists(source)];
                    case 3:
                        _a.apply(void 0, [_d.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.move(source, renamedPath)];
                    case 4:
                        _d.sent();
                        _b = expect;
                        return [4 /*yield*/, client.exists(source)];
                    case 5:
                        _b.apply(void 0, [_d.sent()]).toBe(false);
                        _c = expect;
                        return [4 /*yield*/, client.exists(renamedPath)];
                    case 6:
                        _c.apply(void 0, [_d.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.remove(renamedPath)];
                    case 7:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should work on folders too', function () { return __awaiter(_this, void 0, void 0, function () {
            var folder, source, file, renamed, sourceFilePath, renamedFolderPath, renamedPathFile, _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        folder = randomRootPath();
                        source = randomRootPath();
                        file = randomRootPath();
                        renamed = randomRootPath().slice(1);
                        sourceFilePath = "" + source + file;
                        renamedFolderPath = folder + "/" + renamed;
                        renamedPathFile = "" + renamedFolderPath + file;
                        return [4 /*yield*/, client.createFolderHierarchy(folder)];
                    case 1:
                        _e.sent();
                        return [4 /*yield*/, client.createFolderHierarchy(source)];
                    case 2:
                        _e.sent();
                        return [4 /*yield*/, client.put(sourceFilePath, '')];
                    case 3:
                        _e.sent();
                        _a = expect;
                        return [4 /*yield*/, client.exists(source)];
                    case 4:
                        _a.apply(void 0, [_e.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.move(source, renamedFolderPath)];
                    case 5:
                        _e.sent();
                        _b = expect;
                        return [4 /*yield*/, client.exists(source)];
                    case 6:
                        _b.apply(void 0, [_e.sent()]).toBe(false);
                        _c = expect;
                        return [4 /*yield*/, client.exists(renamedPathFile)];
                    case 7:
                        _c.apply(void 0, [_e.sent()]).toBeTruthy();
                        _d = expect;
                        return [4 /*yield*/, client.exists(renamedFolderPath)];
                    case 8:
                        _d.apply(void 0, [_e.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.remove(renamedFolderPath)];
                    case 9:
                        _e.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getReadStream(path)', function () {
        it('should be able to stream files off of Nextcloud instances', function () { return __awaiter(_this, void 0, void 0, function () {
            var string, path, data, stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        string = 'test';
                        path = randomRootPath();
                        data = '';
                        return [4 /*yield*/, client.put(path, string)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, client.getReadStream(path)];
                    case 2:
                        stream = _a.sent();
                        stream.on('data', function (chunk) { return data += chunk.toString(); });
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                stream.on('end', resolve);
                                stream.on('error', reject);
                            })];
                    case 3:
                        _a.sent();
                        expect(data).toBe(string);
                        return [4 /*yield*/, client.remove(path)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getWriteStream(path)', function () {
        it('should pipe readable streams to the Nextcloud instance', function () { return __awaiter(_this, void 0, void 0, function () {
            var string, path, stream, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        string = 'test';
                        path = randomRootPath();
                        return [4 /*yield*/, client.getWriteStream(path)];
                    case 1:
                        stream = _b.sent();
                        expect(stream instanceof Stream).toBeTruthy();
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                stream.on('end', resolve);
                                stream.on('error', reject);
                                stream.write(string);
                                stream.end();
                            })];
                    case 2:
                        _b.sent();
                        _a = expect;
                        return [4 /*yield*/, client.get(path)];
                    case 3:
                        _a.apply(void 0, [_b.sent()]).toBe(string);
                        return [4 /*yield*/, client.remove(path)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('pipeStream(path, stream)', function () {
        it('should pipe readable streams to the Nextcloud instance', function () { return __awaiter(_this, void 0, void 0, function () {
            var string, path, stream, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        string = 'test';
                        path = randomRootPath();
                        stream = getStream(string);
                        return [4 /*yield*/, client.pipeStream(path, stream)];
                    case 1:
                        _b.sent();
                        _a = expect;
                        return [4 /*yield*/, client.get(path)];
                    case 2:
                        _a.apply(void 0, [_b.sent()]).toBe(string);
                        return [4 /*yield*/, client.remove(path)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Path reservation', function () {
        it('should allow saving a file with empty contents, then getting a write stream for it immediately', function () { return __awaiter(_this, void 0, void 0, function () {
            var path, writeStream, writtenStream, completionPromise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = randomRootPath();
                        return [4 /*yield*/, client.put(path, '')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, client.getWriteStream(path)];
                    case 2:
                        writeStream = _a.sent();
                        writtenStream = getStream('test');
                        completionPromise = new Promise(function (resolve, reject) {
                            writeStream.on('end', resolve);
                            writeStream.on('error', reject);
                        });
                        writtenStream.pipe(writeStream);
                        return [4 /*yield*/, completionPromise];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('file info', function () {
        var path = randomRootPath();
        var file1 = 'file1.txt';
        it('should retrieve extra properties when requested', function () { return __awaiter(_this, void 0, void 0, function () {
            var folderDetails, fileDetails;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.touchFolder(path)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, client.put(path + "/" + file1, '')];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, client.getFolderFileDetails(path, [
                                helper_1.createOwnCloudFileDetailProperty('fileid', true),
                                helper_1.createOwnCloudFileDetailProperty('size', true),
                                helper_1.createOwnCloudFileDetailProperty('owner-id'),
                                helper_1.createNextCloudFileDetailProperty('has-preview', true),
                                helper_1.createFileDetailProperty('http://doesnt/exist', 'de', 'test', false),
                                helper_1.createFileDetailProperty('http://doesnt/exist', 'de', 'test2', false, 42),
                                helper_1.createFileDetailProperty('http://doesnt/exist', 'de', 'test3', true),
                                helper_1.createFileDetailProperty('http://doesnt/exist', 'de', 'test4', true, 37),
                            ])];
                    case 3:
                        folderDetails = _a.sent();
                        folderDetails = folderDetails.filter(function (data) { return data.type === 'file'; });
                        fileDetails = folderDetails[0];
                        expect(fileDetails.extraProperties['owner-id']).toBe('nextcloud');
                        expect(fileDetails.extraProperties['has-preview']).toBe(false);
                        expect(fileDetails.extraProperties['test']).toBeUndefined();
                        expect(fileDetails.extraProperties['test2']).toBe(42);
                        expect(fileDetails.extraProperties['test3']).toBeUndefined();
                        expect(fileDetails.extraProperties['test4']).toBe(37);
                        expect(fileDetails.extraProperties['test999']).toBeUndefined();
                        return [4 /*yield*/, client.remove(path)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('activity', function () {
        var folder1 = randomRootPath();
        var folder2 = folder1 + randomRootPath();
        var file1 = 'file1.txt';
        var file2 = 'file2.txt';
        beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.touchFolder(folder1)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, client.touchFolder(folder2)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, client.put(folder1 + "/" + file1, '')];
                    case 3:
                        _a.sent();
                        // Create activity
                        return [4 /*yield*/, client.move(folder1 + "/" + file1, folder2 + "/" + file1)];
                    case 4:
                        // Create activity
                        _a.sent();
                        return [4 /*yield*/, client.move(folder2 + "/" + file1, folder1 + "/" + file1)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, client.rename(folder1 + "/" + file1, file2)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, client.rename(folder1 + "/" + file2, file1)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        afterEach(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.remove(folder1)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should retrieve the activity information of a file', function () { return __awaiter(_this, void 0, void 0, function () {
            var folderDetails, fileDetails, fileId, allActivities, activity, ascActivities, ascIdx, allIdx, threeAscActivities, idx, sinceAscIdx, twoAscSinceActivities, twoAscIdx, ascIdx, sinceAllIdx, oneAscSinceActivities, errorWhenRequestingWithInvalidActivityId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.getFolderFileDetails(folder1, [
                            helper_1.createOwnCloudFileDetailProperty('fileid', true),
                        ])];
                    case 1:
                        folderDetails = _a.sent();
                        folderDetails = folderDetails.filter(function (data) { return data.type === 'file'; });
                        fileDetails = folderDetails[0];
                        expect(fileDetails.extraProperties['fileid']).toBeDefined();
                        fileId = fileDetails.extraProperties['fileid'];
                        return [4 /*yield*/, client.activities.get(fileId)];
                    case 2:
                        allActivities = _a.sent();
                        expect(allActivities.length).toBe(5);
                        activity = allActivities.filter(function (activity) { return activity.type === 'file_created'; })[0];
                        expect(activity.user).toBe('nextcloud');
                        return [4 /*yield*/, client.activities.get(fileId, 'asc')];
                    case 3:
                        ascActivities = _a.sent();
                        expect(ascActivities.length).toBe(5);
                        expect(ascActivities.length).toBe(allActivities.length);
                        for (ascIdx = 0; ascIdx < ascActivities.length; ascIdx++) {
                            allIdx = (ascActivities.length - 1) - ascIdx;
                            expect(ascActivities[ascIdx].activityId).toBe(allActivities[allIdx].activityId);
                        }
                        return [4 /*yield*/, client.activities.get(fileId, 'asc', 3)];
                    case 4:
                        threeAscActivities = _a.sent();
                        expect(threeAscActivities.length).toBe(3);
                        for (idx = 0; idx < threeAscActivities.length; idx++) {
                            expect(threeAscActivities[idx].activityId).toBe(ascActivities[idx].activityId);
                        }
                        sinceAscIdx = 1;
                        return [4 /*yield*/, client.activities.get(fileId, 'asc', 2, ascActivities[sinceAscIdx].activityId)];
                    case 5:
                        twoAscSinceActivities = _a.sent();
                        for (twoAscIdx = 0; twoAscIdx < twoAscSinceActivities.length; twoAscIdx++) {
                            ascIdx = twoAscIdx + (sinceAscIdx + 1);
                            expect(twoAscSinceActivities[twoAscIdx].activityId).toBe(ascActivities[ascIdx].activityId);
                        }
                        sinceAllIdx = 3;
                        return [4 /*yield*/, client.activities.get(fileId, 'desc', 2, allActivities[sinceAllIdx].activityId)];
                    case 6:
                        oneAscSinceActivities = _a.sent();
                        expect(oneAscSinceActivities.length).toBe(1);
                        expect(oneAscSinceActivities[0].activityId).toBe(allActivities[sinceAllIdx + 1].activityId);
                        errorWhenRequestingWithInvalidActivityId = false;
                        return [4 /*yield*/, client.activities.get(-5)
                                .catch(function (error) {
                                errorWhenRequestingWithInvalidActivityId = true;
                                expect(error).toBeInstanceOf(errors_1.OcsError);
                                expect(error.statusCode).toBe(304);
                            })];
                    case 7:
                        _a.sent();
                        expect(errorWhenRequestingWithInvalidActivityId).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('user info', function () {
        var userId = 'nextcloud';
        var invalidUserId = 'nextcloud2';
        it('should retrieve user information', function () { return __awaiter(_this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.users.get(userId)];
                    case 1:
                        user = _a.sent();
                        expect(user).toBeDefined();
                        expect(user).not.toBeNull();
                        expect(user.enabled).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should get a null value when requesting a non-existing user', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(client.users.get(invalidUserId)).rejects.toBeInstanceOf(errors_1.OcsError)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('common function', function () {
        var userId = 'nextcloud';
        var path = randomRootPath();
        var filePath = "" + path + path;
        var notExistingFilePath = path_1.join(path, 'not_existing_file.txt');
        var notExistingFullPath = path_1.join(randomRootPath(), 'not_existing_file.txt');
        var string = 'Dummy content';
        it('should retrieve the creator of a path', function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, client.touchFolder(path)];
                    case 1:
                        _b.sent();
                        _a = expect;
                        return [4 /*yield*/, client.exists(path)];
                    case 2:
                        _a.apply(void 0, [_b.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.put(filePath, string)];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, expect(client.getCreatorByPath(path)).resolves.toBe(userId)];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, expect(client.getCreatorByPath(filePath)).resolves.toBe(userId)];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, expect(client.getCreatorByPath(notExistingFilePath)).rejects.toBeInstanceOf(Error)];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, expect(client.getCreatorByPath(notExistingFullPath)).rejects.toBeInstanceOf(Error)];
                    case 7:
                        _b.sent();
                        return [4 /*yield*/, client.remove(path)];
                    case 8:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('OCS commands with expected users and groups', function () {
        var numTestUsers = 2;
        var expectedUsers = [];
        expectedUsers.push({
            userid: 'nextcloud',
            password: 'nextcloud',
            displayName: 'nextcloud',
            email: 'admin@nextcloud-link.test'
        });
        for (var i = 1; i <= numTestUsers; i++) {
            expectedUsers.push({
                userid: "test_user" + i,
                password: 'nextcloud',
                displayName: "Test User " + i,
                email: "test_user" + i + "@nextcloud-link.test"
            });
        }
        var numTestGroups = 2;
        var expectedGroups = [
            'admin'
        ];
        for (var i = 1; i <= numTestGroups; i++) {
            expectedGroups.push("group_test_" + i);
        }
        beforeAll(function (done) { return __awaiter(_this, void 0, void 0, function () {
            var error_8;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, expectedUsers
                                .filter(function (user) { return user.userid !== 'nextcloud'; })
                                .forEach(function (user) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, client.users.add(user)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, expectedGroups
                                .filter(function (groupId) { return groupId !== 'admin'; })
                                .forEach(function (groupId) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, client.groups.add(groupId)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () {
                                // Added timeout because Nextcloud doesn't play nice with quick adds and reads.
                                done();
                            }, 2000); })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_8 = _a.sent();
                        console.error('Error during afterAll', error_8);
                        done();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); }, 20000);
        afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
            var userIds, groupIds, error_9;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, client.users.list()];
                    case 1:
                        userIds = _a.sent();
                        if (userIds) {
                            userIds
                                .filter(function (userId) { return userId !== 'nextcloud'; })
                                .forEach(function (userId) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, client.users.delete(userId)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                        }
                        return [4 /*yield*/, client.groups.list()];
                    case 2:
                        groupIds = _a.sent();
                        if (groupIds) {
                            groupIds
                                .filter(function (groupId) { return groupId !== 'admin'; })
                                .forEach(function (groupId) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, client.groups.delete(groupId)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_9 = _a.sent();
                        console.error('Error during afterAll', error_9);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }, 20000);
        it('should add and remove users', function () { return __awaiter(_this, void 0, void 0, function () {
            var user, userAdded, userDeleted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = {
                            userid: 'addUserTest',
                            password: 'nextcloud'
                        };
                        return [4 /*yield*/, client.users.add(user)];
                    case 1:
                        userAdded = _a.sent();
                        return [4 /*yield*/, client.users.delete(user.userid)];
                    case 2:
                        userDeleted = _a.sent();
                        expect(userAdded).toBeTruthy();
                        expect(userDeleted).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); }, 5000);
        it('should list all users', function () { return __awaiter(_this, void 0, void 0, function () {
            var userIds, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.users.list()];
                    case 1:
                        userIds = _a.sent();
                        expect(userIds.length).toBe(expectedUsers.length);
                        for (i = 0; i < userIds.length; i++) {
                            expect(userIds[i]).toBe(expectedUsers[i].userid);
                        }
                        return [2 /*return*/];
                }
            });
        }); }, 10000);
        it('should get data of a single user', function () { return __awaiter(_this, void 0, void 0, function () {
            var expectedUser, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        expectedUser = expectedUsers[1];
                        return [4 /*yield*/, client.users.get(expectedUser.userid)];
                    case 1:
                        user = _a.sent();
                        expect(user.displayname).toBe(expectedUser.displayName);
                        expect(user.enabled).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should manage a user\'s groups', function () { return __awaiter(_this, void 0, void 0, function () {
            var userId, groupId, addedToGroup, groups, removedFromGroup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = expectedUsers[1].userid;
                        groupId = expectedGroups[1];
                        return [4 /*yield*/, client.users.addToGroup(userId, groupId)];
                    case 1:
                        addedToGroup = _a.sent();
                        return [4 /*yield*/, client.users.getGroups(userId)];
                    case 2:
                        groups = _a.sent();
                        return [4 /*yield*/, client.users.removeFromGroup(userId, groupId)];
                    case 3:
                        removedFromGroup = _a.sent();
                        expect(addedToGroup).toBeTruthy();
                        expect(removedFromGroup).toBeTruthy();
                        expect(groups[0]).toBe(groupId);
                        return [2 /*return*/];
                }
            });
        }); }, 10000);
        it('should edit a user', function () { return __awaiter(_this, void 0, void 0, function () {
            var expectedUser, editedDisplayName, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        expectedUser = expectedUsers[1];
                        editedDisplayName = 'Edited displayname';
                        return [4 /*yield*/, client.users.edit(expectedUser.userid, 'displayname', editedDisplayName)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, client.users.get(expectedUser.userid)];
                    case 2:
                        user = _a.sent();
                        expect(user.id).toBe(expectedUser.userid);
                        expect(user.displayname).toBe(editedDisplayName);
                        return [4 /*yield*/, client.users.edit(expectedUser.userid, 'displayname', expectedUser.displayName)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, 13000);
        it('should be able to resend the welcome email', function () { return __awaiter(_this, void 0, void 0, function () {
            var expectedUser, success;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        expectedUser = expectedUsers[1];
                        return [4 /*yield*/, client.users.resendWelcomeEmail(expectedUser.userid)];
                    case 1:
                        success = _a.sent();
                        expect(success).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should be able to change a user\'s enabled state', function () { return __awaiter(_this, void 0, void 0, function () {
            var userId, _a, user, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        userId = expectedUsers[1].userid;
                        _a = expect;
                        return [4 /*yield*/, client.users.setEnabled(userId, false)];
                    case 1:
                        _a.apply(void 0, [_c.sent()]).toBeTruthy();
                        return [4 /*yield*/, client.users.get(userId)];
                    case 2:
                        user = _c.sent();
                        _b = expect;
                        return [4 /*yield*/, client.users.setEnabled(userId, true)];
                    case 3:
                        _b.apply(void 0, [_c.sent()]).toBeTruthy();
                        expect(user.enabled).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); }, 10000);
        it('should be able to change a user\'s subAdmin rights', function () { return __awaiter(_this, void 0, void 0, function () {
            var userId, groupId, addedToGroup, subAdmins, removedFromGroup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = expectedUsers[1].userid;
                        groupId = expectedGroups[1];
                        return [4 /*yield*/, client.users.addSubAdminToGroup(userId, groupId)];
                    case 1:
                        addedToGroup = _a.sent();
                        return [4 /*yield*/, client.users.getSubAdminGroups(userId)];
                    case 2:
                        subAdmins = _a.sent();
                        return [4 /*yield*/, client.users.removeSubAdminFromGroup(userId, groupId)];
                    case 3:
                        removedFromGroup = _a.sent();
                        expect(addedToGroup).toBeTruthy();
                        expect(removedFromGroup).toBeTruthy();
                        expect(subAdmins).toHaveLength(1);
                        expect(subAdmins[0]).toBe(groupId);
                        return [2 /*return*/];
                }
            });
        }); }, 10000);
        it('should list all groups', function () { return __awaiter(_this, void 0, void 0, function () {
            var groupIds, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.groups.list()];
                    case 1:
                        groupIds = _a.sent();
                        expect(groupIds.length).toBe(expectedGroups.length);
                        for (i = 0; i < groupIds.length; i++) {
                            expect(groupIds[i]).toBe(expectedGroups[i]);
                        }
                        return [2 /*return*/];
                }
            });
        }); });
        it('should add and remove groups', function () { return __awaiter(_this, void 0, void 0, function () {
            var groupName, added, groupIds, removed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        groupName = 'addGroupTest';
                        return [4 /*yield*/, client.groups.add(groupName)];
                    case 1:
                        added = _a.sent();
                        return [4 /*yield*/, client.groups.list()];
                    case 2:
                        groupIds = _a.sent();
                        return [4 /*yield*/, client.groups.delete(groupName)];
                    case 3:
                        removed = _a.sent();
                        expect(added).toBeTruthy();
                        expect(removed).toBeTruthy();
                        expect(groupIds).toContain(groupName);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should list the users of a group', function (done) { return __awaiter(_this, void 0, void 0, function () {
            var groupName;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        groupName = expectedGroups[1];
                        return [4 /*yield*/, expectedUsers.forEach(function (user) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, client.users.addToGroup(user.userid, groupName)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                var users;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, client.groups.getUsers(groupName)];
                                        case 1:
                                            users = _a.sent();
                                            return [4 /*yield*/, expectedUsers.forEach(function (user) { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4 /*yield*/, client.users.removeFromGroup(user.userid, groupName)];
                                                            case 1:
                                                                _a.sent();
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); })];
                                        case 2:
                                            _a.sent();
                                            // Added timeout because Nextcloud doesn't play nice with quick adds and reads.
                                            return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                                    var users2;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4 /*yield*/, client.groups.getUsers(groupName)];
                                                            case 1:
                                                                users2 = _a.sent();
                                                                expect(users).toHaveLength(expectedUsers.length);
                                                                expect(users2).toHaveLength(0);
                                                                done();
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); }, 1000); })];
                                        case 3:
                                            // Added timeout because Nextcloud doesn't play nice with quick adds and reads.
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, 1000); })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, 10000);
        it('should list the sub-admins of a group', function (done) { return __awaiter(_this, void 0, void 0, function () {
            var groupName, added, removed;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        groupName = expectedGroups[1];
                        added = {};
                        removed = {};
                        return [4 /*yield*/, expectedUsers.forEach(function (user) { return __awaiter(_this, void 0, void 0, function () {
                                var success;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, client.users.addSubAdminToGroup(user.userid, groupName)];
                                        case 1:
                                            success = _a.sent();
                                            added[user.userid] = success;
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                var usersAfterAdd;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, client.groups.getSubAdmins(groupName)];
                                        case 1:
                                            usersAfterAdd = _a.sent();
                                            return [4 /*yield*/, expectedUsers.forEach(function (user) { return __awaiter(_this, void 0, void 0, function () {
                                                    var success;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4 /*yield*/, client.users.removeSubAdminFromGroup(user.userid, groupName)];
                                                            case 1:
                                                                success = _a.sent();
                                                                removed[user.userid] = success;
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); })];
                                        case 2:
                                            _a.sent();
                                            // Added timeout because Nextcloud doesn't play nice with quick adds and reads.
                                            return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                                    var usersAfterRemove;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4 /*yield*/, client.groups.getSubAdmins(groupName)];
                                                            case 1:
                                                                usersAfterRemove = _a.sent();
                                                                expect(usersAfterAdd).toHaveLength(expectedUsers.length);
                                                                expect(usersAfterRemove).toHaveLength(0);
                                                                expectedUsers.forEach(function (user) {
                                                                    expect(added[user.userid]).toBeTruthy();
                                                                    expect(removed[user.userid]).toBeTruthy();
                                                                });
                                                                done();
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); }, 1000); })];
                                        case 3:
                                            // Added timeout because Nextcloud doesn't play nice with quick adds and reads.
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, 1000); })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, 10000);
        describe('requires files and folders', function () {
            var folder1 = randomRootPath();
            var file1 = 'file1.txt';
            var filePath = folder1 + "/" + file1;
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var error_10;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, client.touchFolder(folder1)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, client.put(folder1 + "/" + file1, '')];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_10 = _a.sent();
                            console.error('Error during file/folder beforeAll', error_10);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            it('should be unable to retrieve acitivies of other users', function () { return __awaiter(_this, void 0, void 0, function () {
                var expectedUser, otherClient, folderDetails, fileDetails, fileId, clientActivities, errorWhenRequestingOtherUserActivities;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            expectedUser = expectedUsers[1];
                            otherClient = client.as(expectedUser.userid, expectedUser.password);
                            return [4 /*yield*/, client.getFolderFileDetails(folder1, [
                                    helper_1.createOwnCloudFileDetailProperty('fileid', true),
                                ])];
                        case 1:
                            folderDetails = _a.sent();
                            folderDetails = folderDetails.filter(function (data) { return data.type === 'file'; });
                            fileDetails = folderDetails[0];
                            fileId = fileDetails.extraProperties['fileid'];
                            return [4 /*yield*/, client.activities.get(fileId)];
                        case 2:
                            clientActivities = _a.sent();
                            errorWhenRequestingOtherUserActivities = false;
                            return [4 /*yield*/, otherClient.activities.get(fileId)
                                    .catch(function (error) {
                                    errorWhenRequestingOtherUserActivities = true;
                                    expect(error).toBeInstanceOf(errors_1.OcsError);
                                    expect(error.statusCode).toBe(304);
                                })];
                        case 3:
                            _a.sent();
                            expect(clientActivities).toHaveLength(1);
                            expect(errorWhenRequestingOtherUserActivities).toBeTruthy();
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('sharing API', function () {
                var password1 = 'as90123490j09jdsad';
                var password2 = 'd90jk0324j0ds9a9ad';
                it('should get a list of all shares', function () { return __awaiter(_this, void 0, void 0, function () {
                    var expectedUser, expectedGroup, shares;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                expectedUser = expectedUsers[1];
                                expectedGroup = expectedGroups[1];
                                return [4 /*yield*/, client.shares.add(folder1, types_1.OcsShareType.publicLink, '', types_1.OcsSharePermissions.read, password1)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, client.shares.add(folder1, types_1.OcsShareType.user, expectedUser.userid, types_1.OcsSharePermissions.all)];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, client.shares.add(folder1, types_1.OcsShareType.group, expectedGroup, types_1.OcsSharePermissions.read | types_1.OcsSharePermissions.delete)];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, client.shares.list()];
                            case 4:
                                shares = _a.sent();
                                expect(shares).toHaveLength(3);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('should create a new share', function () { return __awaiter(_this, void 0, void 0, function () {
                    var expectedGroup, shareType, addedShare;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                expectedGroup = expectedGroups[1];
                                shareType = types_1.OcsShareType.group;
                                return [4 /*yield*/, client.shares.add(folder1, shareType, expectedGroup, types_1.OcsSharePermissions.create | types_1.OcsSharePermissions.delete | types_1.OcsSharePermissions.share)];
                            case 1:
                                addedShare = _a.sent();
                                expect(addedShare).toBeDefined();
                                expect(addedShare.permissions & types_1.OcsSharePermissions.delete).toBe(types_1.OcsSharePermissions.delete);
                                expect(addedShare.permissions & types_1.OcsSharePermissions.update).not.toBe(types_1.OcsSharePermissions.update);
                                expect(addedShare.path).toBe(folder1);
                                expect(addedShare.shareType).toBe(shareType);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('should get shares for a specific file or folder', function () { return __awaiter(_this, void 0, void 0, function () {
                    var nonExistingFolder, expectedUser, expectedGroup, shares, fileShares, errorWhenRequestingNonExistingFolder, errorWhenRequestingSubFilesFromFile;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                nonExistingFolder = '/nonExistingFolder';
                                expectedUser = expectedUsers[1];
                                expectedGroup = expectedGroups[1];
                                return [4 /*yield*/, client.shares.add(folder1, types_1.OcsShareType.publicLink, '', types_1.OcsSharePermissions.read, password1)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, client.shares.add(filePath, types_1.OcsShareType.user, expectedUser.userid, types_1.OcsSharePermissions.all)];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, client.shares.add(filePath, types_1.OcsShareType.group, expectedGroup, types_1.OcsSharePermissions.read | types_1.OcsSharePermissions.delete)];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, client.shares.list(folder1, false, true)];
                            case 4:
                                shares = _a.sent();
                                expect(shares).toHaveLength(2);
                                return [4 /*yield*/, client.shares.list(filePath)];
                            case 5:
                                fileShares = _a.sent();
                                expect(fileShares).toHaveLength(2);
                                errorWhenRequestingNonExistingFolder = false;
                                return [4 /*yield*/, client.shares.list(nonExistingFolder, false, true)
                                        .catch(function (error) {
                                        errorWhenRequestingNonExistingFolder = true;
                                        expect(error).toBeInstanceOf(errors_1.OcsError);
                                        expect(error.statusCode).toBe(404);
                                    })];
                            case 6:
                                _a.sent();
                                expect(errorWhenRequestingNonExistingFolder).toBeTruthy();
                                errorWhenRequestingSubFilesFromFile = false;
                                return [4 /*yield*/, client.shares.list(filePath, false, true)
                                        .catch(function (error) {
                                        errorWhenRequestingSubFilesFromFile = true;
                                        expect(error).toBeInstanceOf(errors_1.OcsError);
                                        expect(error.statusCode).toBe(400);
                                    })];
                            case 7:
                                _a.sent();
                                expect(errorWhenRequestingSubFilesFromFile).toBeTruthy();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('should get information about a known share', function () { return __awaiter(_this, void 0, void 0, function () {
                    var addedShare, share;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, client.shares.add(folder1, types_1.OcsShareType.publicLink, '', types_1.OcsSharePermissions.read, password1)];
                            case 1:
                                addedShare = _a.sent();
                                return [4 /*yield*/, client.shares.get(addedShare.id)];
                            case 2:
                                share = _a.sent();
                                expect(share.id).toBe(addedShare.id);
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('should delete a share', function () { return __awaiter(_this, void 0, void 0, function () {
                    var invalidShareId, addedShare, shareDeleted, errorWhenDeletingInvalidShareId;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                invalidShareId = -1;
                                return [4 /*yield*/, client.shares.add(folder1, types_1.OcsShareType.publicLink, '', types_1.OcsSharePermissions.read, password1)];
                            case 1:
                                addedShare = _a.sent();
                                return [4 /*yield*/, client.shares.delete(addedShare.id)];
                            case 2:
                                shareDeleted = _a.sent();
                                expect(shareDeleted).toBeTruthy();
                                errorWhenDeletingInvalidShareId = false;
                                return [4 /*yield*/, client.shares.delete(invalidShareId)
                                        .catch(function (error) {
                                        errorWhenDeletingInvalidShareId = true;
                                        expect(error).toBeInstanceOf(errors_1.OcsError);
                                        expect(error.statusCode).toBe(404);
                                    })];
                            case 3:
                                _a.sent();
                                expect(errorWhenDeletingInvalidShareId).toBeTruthy();
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('should edit a share', function () { return __awaiter(_this, void 0, void 0, function () {
                    var expectedGroup, tempDate, permissions1, date1, note1, publicSharePermissions1, groupShare, publicShare, permissionsUpdated, expireDateUpdated, noteUpdated, passwordUpdated, publicUploadUpdated;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                expectedGroup = expectedGroups[1];
                                tempDate = new Date();
                                permissions1 = types_1.OcsSharePermissions.all;
                                date1 = tempDate.getFullYear() + 1 + "-06-24";
                                note1 = 'This is the note';
                                publicSharePermissions1 = types_1.OcsSharePermissions.read | types_1.OcsSharePermissions.update | types_1.OcsSharePermissions.create | types_1.OcsSharePermissions.delete;
                                return [4 /*yield*/, client.shares.add(folder1, types_1.OcsShareType.group, expectedGroup, types_1.OcsSharePermissions.delete)];
                            case 1:
                                groupShare = _a.sent();
                                return [4 /*yield*/, client.shares.add(folder1, types_1.OcsShareType.publicLink, '', types_1.OcsSharePermissions.read, password1)];
                            case 2:
                                publicShare = _a.sent();
                                return [4 /*yield*/, client.shares.edit.permissions(groupShare.id, permissions1)];
                            case 3:
                                permissionsUpdated = _a.sent();
                                return [4 /*yield*/, client.shares.edit.expireDate(groupShare.id, date1)];
                            case 4:
                                expireDateUpdated = _a.sent();
                                return [4 /*yield*/, client.shares.edit.note(groupShare.id, note1)];
                            case 5:
                                noteUpdated = _a.sent();
                                return [4 /*yield*/, client.shares.edit.password(publicShare.id, password2)];
                            case 6:
                                passwordUpdated = _a.sent();
                                return [4 /*yield*/, client.shares.edit.publicUpload(publicShare.id, true)];
                            case 7:
                                publicUploadUpdated = _a.sent();
                                expect(permissionsUpdated.permissions).toBe(permissions1);
                                expect(expireDateUpdated.expiration).toBe(date1 + " 00:00:00");
                                expect(noteUpdated.note).toBe(note1);
                                expect(passwordUpdated.password).not.toBe(publicShare.password);
                                expect(publicShare.permissions).toBe(types_1.OcsSharePermissions.read);
                                expect(publicUploadUpdated.permissions).toBe(publicSharePermissions1);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        });
    });
});
function randomRootPath() {
    return "/" + Math.floor(Math.random() * 1000000000);
}
function getStream(string) {
    var stream = new Stream.Readable();
    // See https://stackoverflow.com/questions/12755997/how-to-create-streams-from-string-in-node-js
    stream._read = function () { };
    stream.push(string);
    stream.push(null);
    return stream;
}
//# sourceMappingURL=webdav-jest.js.map