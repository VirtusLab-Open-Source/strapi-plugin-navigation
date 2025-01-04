import { Core, UID } from '@strapi/strapi';

import { omit, once } from 'lodash';
import { NavigationItemDBSchema, navigationItemsDBSchema } from '../schemas';
import { getPluginModels } from '../utils';
import { getGenericRepository } from './generic';

type NavigationItemRemoveMinimal = Partial<NavigationItemDBSchema> &
  Pick<NavigationItemDBSchema, 'documentId'>;

interface FindInput {
  filters: any;
  locale?: string;
  limit?: number;
  populate?: any;
  order?: Record<string, 'asc' | 'desc'>[];
}

interface SaveInput {
  item:
    | (Partial<NavigationItemDBSchema> & {
        documentId: undefined;
      })
    | ({
        documentId: string;
      } & Partial<Omit<NavigationItemDBSchema, 'documentId'>>);
  locale?: string;
}

export const getNavigationItemRepository = once((context: { strapi: Core.Strapi }) => ({
  async save({ item, locale }: SaveInput) {
    const { itemModel } = getPluginModels(context);

    const { __type, documentId } = item?.related ?? {};
    const repository = __type
      ? getGenericRepository(context, __type as UID.ContentType)
      : undefined;
    const related =
      __type && repository
        ? documentId
          ? await repository.findById(documentId, undefined, undefined, { locale })
          : await repository.findFirst(undefined, undefined, { locale })
        : undefined;

    if (typeof item.documentId === 'string') {
      const { documentId, ...rest } = item;

      return context.strapi.documents(itemModel.uid).update({
        documentId: item.documentId,
        data: {
          ...rest,
          related: related ? { ...related, __type } : undefined,
        },
        locale,
      });
    } else {
      return context.strapi.documents(itemModel.uid).create({
        data: {
          ...item,
          related: related ? { ...related, __type } : undefined,
        },
        locale,
      });
    }
  },

  find({ filters, locale, limit, order, populate }: FindInput) {
    const { itemModel } = getPluginModels(context);

    return context.strapi
      .documents(itemModel.uid)
      .findMany({ filters, locale, limit, populate, orderBy: order })
      .then((items) => items.map(flattenRelated))
      .then(navigationItemsDBSchema.parse)
      .then((items) => items.map(removeSensitiveFields));
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

const sensitiveFields = ['id', 'publishedAt', 'createdAt', 'updatedAt', 'locale'];

export const removeSensitiveFields = ({
  related,
  items = [],
  ...item
}: NavigationItemDBSchema): NavigationItemDBSchema => ({
  ...item,
  items: items.map(removeSensitiveFields),
  related: related
    ? (omit(related, sensitiveFields) as NavigationItemDBSchema['related'])
    : undefined,
});

export const flattenRelated = ({ related, ...item }: any) => ({
  ...item,
  related: related?.[0],
});
