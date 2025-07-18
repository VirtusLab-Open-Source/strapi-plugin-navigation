"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderNavigationChild = void 0;
const zod_1 = require("zod");
const utils_1 = require("../../utils");
const renderNavigationChild = ({ strapi, nexus }) => {
    const { nonNull, list, stringArg, booleanArg } = nexus;
    return {
        type: nonNull(list('NavigationItem')),
        args: {
            documentId: nonNull(stringArg()),
            childUiKey: nonNull(stringArg()),
            type: 'NavigationRenderType',
            menuOnly: booleanArg(),
        },
        resolve(_, args) {
            const { documentId, childUIKey, type, menuOnly } = args;
            const idOrSlug = zod_1.z.string().parse(documentId);
            return (0, utils_1.getPluginService)({ strapi }, 'client').renderChildren({
                idOrSlug,
                childUIKey,
                type,
                menuOnly,
                wrapRelated: true,
            });
        },
    };
};
exports.renderNavigationChild = renderNavigationChild;
