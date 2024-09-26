import { Core } from '@strapi/strapi';

import { once } from 'lodash';
import { NavigationItemDBSchema, navigationItemsDBSchema } from '../schemas';
import { getPluginModels } from '../utils';

type NavigationItemRemoveMinimal = Partial<NavigationItemDBSchema> &
  Pick<NavigationItemDBSchema, 'documentId'>;

interface FindInput {
  where: any;
  limit?: number;
  populate?: unknown;
  order?: Record<string, 'asc' | 'desc'>[];
}

export const getNavigationItemRepository = once((context: { strapi: Core.Strapi }) => ({
  save(
    item:
      | (Partial<NavigationItemDBSchema> & { id: undefined })
      | ({ documentId: string } & Partial<Omit<NavigationItemDBSchema, 'documentId'>>)
  ) {
    const { itemModel } = getPluginModels(context);

    if (typeof item.documentId === 'string') {
      const { documentId, id, ...rest } = item;

      return context.strapi.query(itemModel.uid).update({ where: { documentId: item.documentId }, data: { ...rest } });
    } else {
      return context.strapi.query(itemModel.uid).create({ data: item });
    }
  },

  find({ where, limit, order, populate }: FindInput) {
    const { itemModel } = getPluginModels(context);

    return context.strapi
      .query(itemModel.uid)
      .findMany({ where, limit, populate, orderBy: order })
      .then(navigationItemsDBSchema.parse);
  },

  count(where: any) {
    const { itemModel } = getPluginModels(context);

    return context.strapi.query(itemModel.uid).count({ where });
  },

  remove(item: NavigationItemRemoveMinimal) {
    const { itemModel } = getPluginModels(context);

    return context.strapi.query(itemModel.uid).delete({ where: { documentId: item.documentId } });
  },

  removeForIds(ids: string[]) {
    const { itemModel } = getPluginModels(context);

    return context.strapi.query(itemModel.uid).deleteMany({
      where: { documentId: ids },
    });
  },

  findForMasterIds(ids: string[]) {
    const { itemModel } = getPluginModels(context);

    return context.strapi
      .query(itemModel.uid)
      .findMany({
        where: {
          $or: ids.map((documentId) => ({ master: documentId })),
        },
        limit: Number.MAX_SAFE_INTEGER,
      })
      .then(navigationItemsDBSchema.parse);
  },
}));
