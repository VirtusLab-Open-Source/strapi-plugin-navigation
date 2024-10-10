import { z } from 'zod';

import { getPluginService } from '../../utils';

export const renderNavigationChild = ({ strapi, nexus }: any) => {
  const { nonNull, list, stringArg, booleanArg } = nexus;
  return {
    type: nonNull(list('NavigationItem')),

    args: {
      documentId: nonNull(stringArg()),
      childUiKey: nonNull(stringArg()),
      type: 'NavigationRenderType',
      menuOnly: booleanArg(),
    },

    resolve(_: any, args: any) {
      const { documentId, childUIKey, type, menuOnly } = args;
      const idOrSlug = z.string().parse(documentId);

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
