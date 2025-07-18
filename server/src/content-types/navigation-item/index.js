'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lifecycles_1 = __importDefault(require("./lifecycles"));
const schema_1 = __importDefault(require("./schema"));
exports.default = {
    schema: schema_1.default,
    lifecycles: lifecycles_1.default,
};
