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
exports.contentTypeSchema = exports.contentTypeFullSchema = exports.contentTypeAttributes = exports.contentTypeRelationAttribute = exports.contentTypeRelationType = exports.contentTypeMediaAttribute = exports.contentTypeUidAttribute = exports.contentTypeDynamicZoneAttribute = exports.contentTypeComponentAttribute = exports.contentTypeEnumerationAttribute = exports.simpleContentTypeAttribute = exports.contentTypeFieldTypeSchema = exports.contentTypeAttributeValidator = exports.contentTypeInfo = exports.contentType = void 0;
const z = __importStar(require("zod"));
exports.contentType = z.enum(['collectionType', 'singleType']);
exports.contentTypeInfo = z.object({
    singularName: z.string(),
    pluralName: z.string(),
    displayName: z.string(),
    description: z.string().optional(),
    name: z.string().optional(),
});
exports.contentTypeAttributeValidator = z.object({
    required: z.boolean().optional(),
    max: z.number().optional(),
    min: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    private: z.boolean().optional(),
    configurable: z.boolean().optional(),
    default: z.any().optional(),
});
exports.contentTypeFieldTypeSchema = z.enum([
    'string',
    'text',
    'richtext',
    'blocks',
    'email',
    'password',
    'date',
    'time',
    'datetime',
    'timestamp',
    'boolean',
    'integer',
    'biginteger',
    'float',
    'decimal',
    'json',
    'relation',
    'media',
]);
exports.simpleContentTypeAttribute = exports.contentTypeAttributeValidator.extend({
    type: exports.contentTypeFieldTypeSchema,
});
exports.contentTypeEnumerationAttribute = exports.contentTypeAttributeValidator.extend({
    type: z.literal('enumeration'),
    enum: z.string().array(),
});
exports.contentTypeComponentAttribute = z.object({
    type: z.literal('component'),
    component: z.string(),
    repeatable: z.boolean().optional(),
});
exports.contentTypeDynamicZoneAttribute = z.object({
    type: z.literal('dynamiczone'),
    components: z.string().array(),
});
exports.contentTypeUidAttribute = z.object({
    type: z.literal('uid'),
});
exports.contentTypeMediaAttribute = z.object({
    type: z.literal('media'),
    allowedTypes: z.enum(['images', 'videos', 'audios', 'files']).array(),
    required: z.boolean().optional(),
});
exports.contentTypeRelationType = z.enum([
    'oneToOne',
    'oneToMany',
    'manyToOne',
    'manyToMany',
    'morphToMany',
    'manyToMorph',
]);
exports.contentTypeRelationAttribute = z.object({
    type: z.literal('relation'),
    relation: exports.contentTypeRelationType,
    target: z.string(),
    mappedBy: z.string().optional(),
    inversedBy: z.string().optional(),
});
exports.contentTypeAttributes = z.record(z.string(), z.union([
    exports.simpleContentTypeAttribute,
    exports.contentTypeEnumerationAttribute,
    exports.contentTypeComponentAttribute,
    exports.contentTypeDynamicZoneAttribute,
    exports.contentTypeRelationAttribute,
    exports.contentTypeMediaAttribute,
    exports.contentTypeUidAttribute,
]));
exports.contentTypeFullSchema = z.object({
    kind: exports.contentType,
    collectionName: z.string(),
    info: exports.contentTypeInfo,
    options: z
        .object({
        draftAndPublish: z.boolean().optional(),
        hidden: z.boolean().optional(),
        templateName: z.string().optional(),
    })
        .optional(),
    attributes: exports.contentTypeAttributes,
    actions: z.record(z.string(), z.any()).optional(),
    lifecycles: z.record(z.string(), z.any()).optional(),
    uid: z.string(),
    apiName: z.string().optional(),
    // TODO?: remove
    associations: z
        .object({
        model: z.string(),
        alias: z.string(),
    })
        .array()
        .optional(),
    modelName: z.string().optional(),
    plugin: z.string().optional(),
    pluginOptions: z.record(z.string(), z.any()).optional(),
    isSingle: z.boolean().optional(),
});
exports.contentTypeSchema = exports.contentTypeFullSchema.pick({
    info: true,
    kind: true,
    attributes: true,
    options: true,
});
