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
exports.configSchema = exports.navigationItemAdditionalField = exports.navigationItemCustomField = void 0;
const z = __importStar(require("zod"));
const navigationCustomFieldBase = z.object({
    name: z
        .string({ required_error: 'requiredError' })
        .nonempty('requiredError')
        .refine((current) => !current.includes(' '), { message: 'noSpaceError' }),
    label: z.string({ required_error: 'requiredError' }).nonempty('requiredError'),
    description: z.string().optional(),
    placeholder: z.string().optional(),
    required: z.boolean().optional(),
    enabled: z.boolean().optional(),
});
const navigationItemCustomFieldSelect = navigationCustomFieldBase.extend({
    type: z.literal('select'),
    multi: z.boolean(),
    options: z
        .array(z.string(), { required_error: 'requiredError' })
        .min(1, { message: 'requiredError' }),
});
const navigationItemCustomFieldPrimitive = navigationCustomFieldBase.extend({
    type: z.enum(['boolean', 'string']),
    multi: z.literal(false).optional(),
    options: z.array(z.string()).max(0).optional(),
});
const navigationItemCustomFieldMedia = navigationCustomFieldBase.extend({
    type: z.literal('media'),
    multi: z.literal(false).optional(),
    options: z.array(z.string()).max(0).optional(),
});
exports.navigationItemCustomField = z.discriminatedUnion('type', [
    navigationItemCustomFieldPrimitive,
    navigationItemCustomFieldMedia,
    navigationItemCustomFieldSelect,
]);
exports.navigationItemAdditionalField = z.union([
    z.literal('audience'),
    exports.navigationItemCustomField,
]);
exports.configSchema = z.object({
    additionalFields: z.array(exports.navigationItemAdditionalField),
    allowedLevels: z.number(),
    contentTypes: z.array(z.string()),
    defaultContentType: z.string().optional(),
    contentTypesNameFields: z.record(z.string(), z.array(z.string())),
    contentTypesPopulate: z.record(z.string(), z.array(z.string())),
    gql: z.object({
        navigationItemRelated: z.array(z.string()),
    }),
    pathDefaultFields: z.record(z.string(), z.any()),
    cascadeMenuAttached: z.boolean(),
    preferCustomContentTypes: z.boolean(),
    isCacheEnabled: z.boolean().optional(),
});
