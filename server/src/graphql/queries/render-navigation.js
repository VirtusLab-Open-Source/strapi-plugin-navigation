"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderNavigation = void 0;
const zod_1 = require("zod");
const utils_1 = require("../../utils");
const LOCALE_SCALAR_TYPENAME = 'I18NLocaleCode';
const renderNavigation = ({ strapi, nexus }) => {
    const { nonNull, list, stringArg, booleanArg } = nexus;
    const defaultArgs = {
        navigationIdOrSlug: nonNull(stringArg()),
        type: 'NavigationRenderType',
        menuOnly: booleanArg(),
        path: stringArg(),
        locale: nexus.arg({ type: LOCALE_SCALAR_TYPENAME }),
    };
    const args = defaultArgs;
    return {
        args,
        type: nonNull(list('NavigationItem')),
        resolve(_, { navigationIdOrSlug, type, menuOnly, path: rootPath, locale }) {
            const idOrSlug = zod_1.z.string().parse(navigationIdOrSlug);
            return (0, utils_1.getPluginService)({ strapi }, 'client').render({
                idOrSlug,
                type,
                rootPath,
                locale,
                menuOnly,
                wrapRelated: true,
            });
        },
    };
};
exports.renderNavigation = renderNavigation;
