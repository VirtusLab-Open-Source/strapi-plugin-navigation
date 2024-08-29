import { Core } from '@strapi/strapi';

import { once } from 'lodash';
import { NavigationItemDBSchema, navigationItemsDBSchema } from '../schemas';
import { getPluginModels } from '../utils';

type NavigationItemRemoveMinimal = Partial<NavigationItemDBSchema> &
  Pick<NavigationItemDBSchema, 'id'>;

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
      | ({ id: number } & Partial<Omit<NavigationItemDBSchema, 'id'>>)
  ) {
    const { itemModel } = getPluginModels(context);

    if (typeof item.id === 'number') {
      const { id, ...rest } = item;

      return context.strapi.query(itemModel.uid).update({ where: { id: item.id }, data: { ...rest } });
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

    return context.strapi.query(itemModel.uid).delete({ where: { id: item.id } });
  },

  removeForIds(ids: number[]) {
    const { itemModel } = getPluginModels(context);

    return context.strapi.query(itemModel.uid).deleteMany({
      where: { id: ids },
    });
  },

  findForMasterIds(ids: number[]) {
    const { itemModel } = getPluginModels(context);

    return context.strapi
      .query(itemModel.uid)
      .findMany({
        where: {
          $or: ids.map((id) => ({ master: id })),
        },
        limit: Number.MAX_SAFE_INTEGER,
      })
      .then(navigationItemsDBSchema.parse);
  },
}));
