import { Core } from '@strapi/strapi';
import { once } from 'lodash';
import { audienceDBSchema } from '../schemas';
import { getPluginModels } from '../utils';

export const getAudienceRepository = once((context: { strapi: Core.Strapi }) => ({
  find(where: Record<string, unknown>, limit?: number) {
    const {
      audienceModel: { uid },
    } = getPluginModels(context);

    return context.strapi.query(uid).findMany({ where, limit }).then(audienceDBSchema.array().parse);
  },
}));
