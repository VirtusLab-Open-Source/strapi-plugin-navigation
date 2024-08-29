import { z } from 'zod';

import { parseId } from '../../controllers/utils';
import { getPluginService } from '../../utils';

export const renderNavigationChild = ({ strapi, nexus }: any) => {
  const { nonNull, list, stringArg, booleanArg } = nexus;
  return {
    type: nonNull(list('NavigationItem')),

    args: {
      id: nonNull(stringArg()),
      childUiKey: nonNull(stringArg()),
      type: 'NavigationRenderType',
      menuOnly: booleanArg(),
    },

    resolve(_: any, args: any) {
      const { id, childUIKey, type, menuOnly } = args;
      const idOrSlug = parseId(z.string().parse(id));

      console.log({
        type,
        menuOnly,
        idOrSlug,
        _,
      });

      return getPluginService({ strapi }, 'client').renderChildren({
        idOrSlug,
        childUIKey,
        type,
        menuOnly,
        wrapRelated: true,
      });
    },
  };
};
