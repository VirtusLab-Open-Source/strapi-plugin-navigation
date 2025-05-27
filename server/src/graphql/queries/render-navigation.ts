import { z } from 'zod';

import { getPluginService } from '../../utils';

const LOCALE_SCALAR_TYPENAME = 'I18NLocaleCode';

export const renderNavigation = ({ strapi, nexus }: any) => {
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
    resolve(_: unknown, { navigationIdOrSlug, type, menuOnly, path: rootPath, locale }: any) {
      const idOrSlug = z.string().parse(navigationIdOrSlug);

      return getPluginService({ strapi }, 'client').render({
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
