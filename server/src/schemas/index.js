"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicSchemas = exports.updateUpdateNavigationSchema = exports.updateCreateNavigationSchema = exports.updateNavigationItemCustomField = exports.updateNavigationItemAdditionalField = exports.updateConfigSchema = exports.updateNavigationItemsSchema = exports.updateNavigationItemSchema = exports.readNavigationItemFromLocaleSchema = exports.navigationItemType = exports.navigationItemsDBSchema = exports.navigationItemDBSchema = exports.navigationDBSchema = exports.audienceDBSchema = void 0;
const config_1 = require("./config");
const navigation_1 = require("./navigation");
__exportStar(require("./content-type"), exports);
var navigation_2 = require("./navigation");
Object.defineProperty(exports, "audienceDBSchema", { enumerable: true, get: function () { return navigation_2.audienceDBSchema; } });
Object.defineProperty(exports, "navigationDBSchema", { enumerable: true, get: function () { return navigation_2.navigationDBSchema; } });
Object.defineProperty(exports, "navigationItemDBSchema", { enumerable: true, get: function () { return navigation_2.navigationItemDBSchema; } });
Object.defineProperty(exports, "navigationItemsDBSchema", { enumerable: true, get: function () { return navigation_2.navigationItemsDBSchema; } });
Object.defineProperty(exports, "navigationItemType", { enumerable: true, get: function () { return navigation_2.navigationItemType; } });
Object.defineProperty(exports, "readNavigationItemFromLocaleSchema", { enumerable: true, get: function () { return navigation_2.readNavigationItemFromLocaleSchema; } });
Object.defineProperty(exports, "updateNavigationItemSchema", { enumerable: true, get: function () { return navigation_2.updateNavigationItemSchema; } });
Object.defineProperty(exports, "updateNavigationItemsSchema", { enumerable: true, get: function () { return navigation_2.updateNavigationItemsSchema; } });
const applySchemaRefineHigher = (baseGetter, updater) => (modifier) => {
    updater(modifier(baseGetter()));
};
let configSchema = config_1.configSchema;
exports.updateConfigSchema = applySchemaRefineHigher(() => configSchema, (next) => {
    configSchema = next;
});
let navigationItemAdditionalField = config_1.navigationItemAdditionalField;
exports.updateNavigationItemAdditionalField = applySchemaRefineHigher(() => navigationItemAdditionalField, (next) => {
    navigationItemAdditionalField = next;
});
let navigationItemCustomField = config_1.navigationItemCustomField;
exports.updateNavigationItemCustomField = applySchemaRefineHigher(() => navigationItemCustomField, (next) => {
    navigationItemCustomField = next;
});
let createNavigationSchema = navigation_1.createNavigationSchema;
exports.updateCreateNavigationSchema = applySchemaRefineHigher(() => createNavigationSchema, (next) => {
    createNavigationSchema = next;
});
let updateNavigationSchema = navigation_1.updateNavigationSchema;
exports.updateUpdateNavigationSchema = applySchemaRefineHigher(() => updateNavigationSchema, (next) => {
    updateNavigationSchema = next;
});
exports.DynamicSchemas = {
    get configSchema() {
        return configSchema;
    },
    get navigationItemAdditionalField() {
        return navigationItemAdditionalField;
    },
    get navigationItemCustomField() {
        return navigationItemCustomField;
    },
    get createNavigationSchema() {
        return createNavigationSchema;
    },
    get updateNavigationSchema() {
        return updateNavigationSchema;
    },
};
