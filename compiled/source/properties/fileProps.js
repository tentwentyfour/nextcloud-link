"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var FileProps = /** @class */ (function () {
    function FileProps(path, props, dirtyProps) {
        var _this = this;
        if (dirtyProps === void 0) { dirtyProps = {}; }
        this.path = path;
        this.props = props;
        this.dirtyProps = dirtyProps;
        this.withProperty = function (name, value) {
            var _a;
            var dirty = (_a = {}, _a[name] = value, _a);
            return new FileProps(_this.path, _this.props, dirty);
        };
        this.getProperty = function (name) {
            return _this.dirtyProps[name] || _this.props[name];
        };
        this.all = function () {
            return Object.keys(__assign({}, _this.props, _this.dirtyProps)).reduce(function (carry, key) {
                carry.push({
                    name: key,
                    value: _this.dirtyProps[key] || _this.props[key],
                });
                return carry;
            }, []);
        };
        this.dirty = function () {
            return Object.keys(_this.dirtyProps).reduce(function (carry, key) {
                carry.push({ name: key, value: _this.dirtyProps[key] });
                return carry;
            }, []);
        };
    }
    return FileProps;
}());
exports.FileProps = FileProps;
//# sourceMappingURL=fileProps.js.map