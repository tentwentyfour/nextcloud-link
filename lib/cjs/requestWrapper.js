"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.req = void 0;
const axios_1 = __importDefault(require("axios"));
function req(options, callback) {
    (0, axios_1.default)({
        method: 'GET',
        validateStatus: () => true,
        ...options
    })
        .then(async (response) => {
        callback(null, response, response?.data);
    })
        .catch((error) => {
        callback(error, null, null);
    });
}
exports.req = req;
