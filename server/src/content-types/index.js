'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const audience_1 = __importDefault(require("./audience"));
const navigation_1 = __importDefault(require("./navigation"));
const navigation_item_1 = __importDefault(require("./navigation-item"));
exports.default = {
    audience: audience_1.default,
    navigation: navigation_1.default,
    'navigation-item': navigation_item_1.default,
};
