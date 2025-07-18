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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNavigationSchema = exports.updateNavigationItemsSchema = exports.updateNavigationItemSchema = exports.createNavigationSchema = exports.navigationDBSchema = exports.navigationItemsDBSchema = exports.navigationItemDBSchema = exports.readNavigationItemFromLocaleSchema = exports.navigationItemType = exports.audienceDBSchema = void 0;
const z = __importStar(require("zod"));
exports.audienceDBSchema = z.object({
    id: z.number(),
    documentId: z.string(),
    name: z.string(),
    key: z.string(),
});
exports.navigationItemType = z.enum(['INTERNAL', 'EXTERNAL', 'WRAPPER']);
const navigationItemDBBaseSchema = z.object({
    id: z.number(),
    documentId: z.string(),
    title: z.string(),
    type: exports.navigationItemType,
    path: z.string().or(z.null()).optional(),
    slug: z.string().or(z.null()).optional(),
    externalPath: z.string().or(z.null()).optional(),
    uiRouterKey: z.string(),
    menuAttached: z.boolean(),
    order: z.number().int(),
    collapsed: z.boolean(),
    related: z
        .object({ documentId: z.string().optional(), __type: z.string() })
        .catchall(z.unknown())
        .nullish()
        .optional(),
    additionalFields: z.record(z.string(), z.unknown()).or(z.null()).optional(),
    audience: z.array(exports.audienceDBSchema).or(z.null()).optional(),
    autoSync: z.boolean().or(z.null()).optional(),
});
exports.readNavigationItemFromLocaleSchema = navigationItemDBBaseSchema
    .omit({
    related: true,
})
    .pick({
    path: true,
    type: true,
    uiRouterKey: true,
    title: true,
    externalPath: true,
})
    .extend({ related: z.unknown().optional() });
exports.navigationItemDBSchema = navigationItemDBBaseSchema.extend({
    parent: z.lazy(() => exports.navigationItemDBSchema.or(z.null())).optional(),
    items: z.lazy(() => exports.navigationItemDBSchema.array()).optional(),
    master: z.lazy(() => (0, exports.navigationDBSchema)(false)).optional(),
});
exports.navigationItemsDBSchema = z.array(exports.navigationItemDBSchema);
const navigationDBSchema = (withItems) => z.object({
    id: z.number(),
    documentId: z.string(),
    name: z.string(),
    slug: z.string(),
    locale: z.string(),
    visible: z.boolean(),
    items: withItems ? z.array(exports.navigationItemDBSchema) : exports.navigationItemDBSchema.array().optional(),
});
exports.navigationDBSchema = navigationDBSchema;
exports.createNavigationSchema = (0, exports.navigationDBSchema)(false)
    .omit({
    items: true,
    id: true,
    documentId: true,
    slug: true,
    locale: true,
})
    .extend({
    documentId: z.string().optional(),
    id: z.undefined().optional(),
});
exports.updateNavigationItemSchema = navigationItemDBBaseSchema
    .omit({ id: true, documentId: true })
    .extend({
    id: z.number().optional(),
    documentId: z.string().optional(),
    items: z
        .lazy(() => exports.updateNavigationItemsSchema)
        .or(z.null())
        .optional(),
    updated: z.boolean().optional(),
    removed: z.boolean().optional(),
});
exports.updateNavigationItemsSchema = z.array(exports.updateNavigationItemSchema);
exports.updateNavigationSchema = (0, exports.navigationDBSchema)(false)
    .extend({
    items: exports.updateNavigationItemsSchema,
})
    .partial()
    .required({
    id: true,
    documentId: true,
});
