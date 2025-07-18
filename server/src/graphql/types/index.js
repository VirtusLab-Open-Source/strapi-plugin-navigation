"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypes = void 0;
const content_types_1 = __importDefault(require("./content-types"));
const content_types_name_fields_1 = __importDefault(require("./content-types-name-fields"));
const create_navigation_1 = __importDefault(require("./create-navigation"));
const create_navigation_item_1 = __importDefault(require("./create-navigation-item"));
const create_navigation_related_1 = __importDefault(require("./create-navigation-related"));
const navigation_1 = __importDefault(require("./navigation"));
const navigation_config_1 = __importDefault(require("./navigation-config"));
const navigation_details_1 = __importDefault(require("./navigation-details"));
const navigation_item_1 = __importDefault(require("./navigation-item"));
const navigation_item_additional_fields_1 = __importDefault(require("./navigation-item-additional-fields"));
const navigation_item_related_1 = __importDefault(require("./navigation-item-related"));
const navigation_item_type_1 = __importDefault(require("./navigation-item-type"));
const navigation_render_type_1 = __importDefault(require("./navigation-render-type"));
const typesFactories = [
    navigation_item_additional_fields_1.default,
    navigation_item_related_1.default,
    navigation_item_1.default,
    navigation_render_type_1.default,
    navigation_1.default,
    navigation_details_1.default,
    content_types_name_fields_1.default,
    content_types_1.default,
    navigation_config_1.default,
    create_navigation_related_1.default,
    create_navigation_item_1.default,
    create_navigation_1.default,
    navigation_item_type_1.default,
];
const getTypes = (context) => {
    return typesFactories.map((factory) => factory(context));
};
exports.getTypes = getTypes;
