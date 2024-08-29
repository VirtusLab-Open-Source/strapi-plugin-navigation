import { createId } from '@paralleldrive/cuid2';
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

interface FindInput {
  where: any;
  limit?: number;
  populate?: any;
  orderBy?: Record<string, string>;
}

interface FindOneInput {
  where: any;
  populate?: any;
}

const calculateItemsRequirement = (populate: any) => {
  return populate === true ? true : Array.isArray(populate) ? populate.includes('items') : false;
};

export const getNavigationRepository = once((context: { strapi: Core.Strapi }) => ({
  find({ where, limit, orderBy, populate }: FindInput) {
    const { masterModel } = getPluginModels(context);

    return context.strapi
      .query(masterModel.uid)
      .findMany({ where, limit, populate, orderBy })
      .then((data) => {
        return navigationDBSchema(calculateItemsRequirement(populate)).array().parse(data);
      });
  },

  findOne({ where, populate }: FindOneInput) {
    const { masterModel } = getPluginModels(context);

    return context.strapi
      .query(masterModel.uid)
      .findOne({ where, populate })
      .then((data) => {
        return navigationDBSchema(calculateItemsRequirement(populate)).parse(data);
      });
  },

  save(
    navigation: CreateNavigationSchema | (Omit<UpdateNavigationSchema, 'items'> & { items?: never })
  ) {
    const { masterModel } = getPluginModels(context);

    if (navigation.id) {
      return context.strapi
        .query(masterModel.uid)
        .update({
          where: { id: navigation.id },
          data: omit(navigation, ['id', 'documentId']),
          populate: ['items'],
        })
        .then(navigationDBSchema(false).parse);
    } else {
      return context.strapi
        .query(masterModel.uid)
        .create({
          data: {
            ...navigation,
            documentId: navigation.documentId ?? createId(),
            populate: ['items'],
          },
        })
        .then((x) => {
          return navigationDBSchema(false).parse(x);
        });
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
