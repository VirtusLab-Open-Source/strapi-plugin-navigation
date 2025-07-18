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
exports.default = clientController;
const z = __importStar(require("zod"));
const utils_1 = require("../utils");
const utils_2 = require("./utils");
const validators_1 = require("./validators");
function clientController(context) {
    return {
        getService() {
            return (0, utils_1.getPluginService)(context, 'client');
        },
        async readAll(ctx) {
            try {
                const { query = {} } = ctx;
                const { locale, orderBy, orderDirection } = validators_1.readAllQuerySchema.parse(query);
                return await this.getService().readAll({
                    locale,
                    orderBy,
                    orderDirection,
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    return ctx.badRequest(error.message);
                }
                throw error;
            }
        },
        async render(ctx) {
            const { params, query = {} } = ctx;
            const { type, menu: menuOnly, path: rootPath, locale, populate, } = validators_1.renderQuerySchema.parse(query);
            const idOrSlug = z.string().parse(params.idOrSlug);
            return await this.getService().render({
                idOrSlug,
                type,
                menuOnly: menuOnly === 'true',
                rootPath,
                locale,
                populate: (0, utils_2.sanitizePopulateField)(validators_1.populateSchema.parse(populate === 'true'
                    ? true
                    : populate === 'false'
                        ? false
                        : Array.isArray(populate)
                            ? populate.map((x) => (x === 'true' ? true : x === 'false' ? false : populate))
                            : populate)),
            });
        },
        async renderChild(ctx) {
            const { params, query = {} } = ctx;
            const { type, menu: menuOnly, locale } = validators_1.renderChildQueryParams.parse(query);
            const idOrSlug = z.string().parse(params.documentId);
            const childUIKey = z.string().parse(params.childUIKey);
            return await this.getService().renderChildren({
                idOrSlug,
                childUIKey,
                type,
                menuOnly: menuOnly === 'true',
                locale,
            });
        },
    };
}
