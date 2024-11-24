import { Core } from '@strapi/strapi';
import { omit, once } from 'lodash';

import { NavigationError } from '../app-errors';
import {
  CreateNavigationSchema,
  NavigationDBSchema,
  UpdateNavigationSchema,
  navigationDBSchema,
} from '../schemas';
import { getPluginModels } from '../utils';
import { flattenRelated, removeSensitiveFields } from './navigation-item';

interface FindInput {
  filters?: any;
  limit?: number;
  locale?: string;
  populate?: any;
  orderBy?: Record<string, string>;
}

interface FindOneInput {
  filters?: any;
  locale?: string;
  populate?: any;
}

const calculateItemsRequirement = (populate: any) => {
  return populate === true ? true : Array.isArray(populate) ? populate.includes('items') : false;
};

export const getNavigationRepository = once((context: { strapi: Core.Strapi }) => ({
  find({ filters, locale, limit, orderBy, populate }: FindInput) {
    const { masterModel } = getPluginModels(context);

    return context.strapi
      .documents(masterModel.uid)
      .findMany({ filters, locale, limit, populate, orderBy })
      .then((data) =>
        data.map(({ items, ...navigation }) => ({
          ...navigation,
          items: items?.map(flattenRelated),
        }))
      )
      .then((data) =>
        data.map(({ items, ...navigation }) => ({
          ...navigation,
          items: items?.map(removeSensitiveFields),
        }))
      )
      .then((data) => {
        return navigationDBSchema(calculateItemsRequirement(populate)).array().parse(data);
      });
  },

  findOne({ locale, filters, populate }: FindOneInput) {
    const { masterModel } = getPluginModels(context);

    return context.strapi
      .documents(masterModel.uid)
      .findOne({ documentId: filters.documentId, locale, populate })
      .then((data) => (data ? { ...data, items: data.items?.map(flattenRelated) } : data))
      .then((data) => {
        return navigationDBSchema(calculateItemsRequirement(populate)).parse(data);
      })
      .then((navigation) => ({
        ...navigation,
        items: navigation.items?.map(removeSensitiveFields),
      }));
  },

  async save(
    navigation:
      | (CreateNavigationSchema & { locale?: string, items?: unknown })
      | (Omit<UpdateNavigationSchema, 'items'> & { items?: never })
  ) {
    const { masterModel } = getPluginModels(context);
    const { documentId, locale, ...rest } = navigation;

    if (documentId) {
      return context.strapi
        .documents(masterModel.uid)
        .update({
          locale,
          documentId: documentId,
          data: omit(rest, ['id', 'documentId']),
          populate: ['items'],
        })
        .then(navigationDBSchema(false).parse);
    } else {
      return context.strapi
        .documents(masterModel.uid)
        .create({
          locale,
          data: {
            ...rest,
            populate: ['items'],
          },
        })
        .then(navigationDBSchema(false).parse);
    }
  },

  remove(navigation: Partial<Pick<NavigationDBSchema, 'id' | 'documentId'>>) {
    const { masterModel } = getPluginModels(context);

    if (!navigation.documentId && !navigation.id) {
      throw new NavigationError('Some kind of id required. None given.');
    }

    return context.strapi.query(masterModel.uid).deleteMany({ where: navigation });
  },
}));
