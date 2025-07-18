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
exports.default = adminController;
const z = __importStar(require("zod"));
const schemas_1 = require("../schemas");
const utils_1 = require("../utils");
const validators_1 = require("./validators");
function adminController(context) {
    return {
        getAdminService() {
            return (0, utils_1.getPluginService)(context, 'admin');
        },
        getCommonService() {
            return (0, utils_1.getPluginService)(context, 'common');
        },
        async get() {
            return await this.getAdminService().get({});
        },
        async post(ctx) {
            const { auditLog } = ctx;
            try {
                return await this.getAdminService().post({
                    payload: schemas_1.DynamicSchemas.createNavigationSchema.parse(ctx.request.body),
                    auditLog,
                });
            }
            catch (error) {
                const originalError = error instanceof Error
                    ? {
                        name: error.name,
                        message: error.message,
                    }
                    : {};
                return ctx.internalServerError('Unable to create', { originalError });
            }
        },
        async put(ctx) {
            const { params: { documentId }, auditLog, } = ctx;
            const body = z.record(z.string(), z.unknown()).parse(ctx.request.body);
            try {
                return await this.getAdminService().put({
                    auditLog,
                    payload: schemas_1.DynamicSchemas.updateNavigationSchema.parse({
                        ...body,
                        documentId,
                    }),
                });
            }
            catch (error) {
                const originalError = error instanceof Error
                    ? {
                        name: error.name,
                        message: error.message,
                    }
                    : {};
                return ctx.internalServerError('Unable to update', { originalError });
            }
        },
        async delete(ctx) {
            const { auditLog, params: { documentId }, } = ctx;
            await this.getAdminService().delete({
                documentId: validators_1.idSchema.parse(documentId),
                auditLog,
            });
            return {};
        },
        config() {
            return this.getAdminService().config({ viaSettingsPage: false });
        },
        async updateConfig(ctx) {
            await this.getAdminService().updateConfig({
                config: schemas_1.DynamicSchemas.configSchema.parse(ctx.request.body),
            });
            return {};
        },
        async restoreConfig() {
            await this.getAdminService().restoreConfig();
            return {};
        },
        settingsConfig() {
            return this.getAdminService().config({ viaSettingsPage: true });
        },
        async settingsRestart() {
            await this.getAdminService().restart();
            return {};
        },
        getById(ctx) {
            const { params: { documentId }, } = ctx;
            return this.getAdminService().getById({ documentId: validators_1.idSchema.parse(documentId) });
        },
        getContentTypeItems(ctx) {
            const { params: { model }, query = {}, } = ctx;
            return this.getAdminService().getContentTypeItems({
                query: z.record(z.string(), z.unknown()).parse(query),
                uid: z.string().parse(model),
            });
        },
        async fillFromOtherLocale(ctx) {
            const { params, auditLog } = ctx;
            const { source, target, documentId } = validators_1.fillFromOtherLocaleParams.parse(params);
            return await this.getAdminService().fillFromOtherLocale({
                source,
                target,
                documentId,
                auditLog,
            });
        },
        readNavigationItemFromLocale(ctx) {
            const { params: { source, target }, query: { path }, } = ctx;
            return this.getAdminService().readNavigationItemFromLocale({
                path: z.string().parse(path),
                source: validators_1.idSchema.parse(source),
                target: validators_1.idSchema.parse(target),
            });
        },
        getSlug(ctx) {
            const { query: { q }, } = ctx;
            return this.getCommonService()
                .getSlug({ query: z.string().parse(q) })
                .then((slug) => ({ slug }));
        },
        settingsLocale() {
            return this.getCommonService().readLocale();
        },
    };
}
