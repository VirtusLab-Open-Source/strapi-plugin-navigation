import { Core } from '@strapi/strapi';

import handleConfig from './config';

export const graphQLSetup = async ({ strapi }: { strapi: Core.Strapi }) => {
  const hasGraphQLPlugin = !!strapi.plugin('graphql');

  if (hasGraphQLPlugin) {
    await handleConfig({ strapi });
  }
};
