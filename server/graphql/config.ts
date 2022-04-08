import { StrapiContext } from "strapi-typed";
import { NavigationPluginConfig } from "../../types";

const getTypes = require("./types");
const getQueries = require("./queries");
const getResolversConfig = require("./resolvers-config");

type ConfigInput = StrapiContext & {
  config: NavigationPluginConfig;
};

export default async ({ strapi, config }: ConfigInput) => {
  const extensionService = strapi.plugin("graphql").service("extension");

  extensionService.shadowCRUD("plugin::navigation.audience").disable();
  extensionService.shadowCRUD("plugin::navigation.navigation").disable();
  extensionService.shadowCRUD("plugin::navigation.navigation-item").disable();
  extensionService
    .shadowCRUD("plugin::navigation.navigations-items-related")
    .disable();

  extensionService.use(({ strapi, nexus }: any) => {
    const types = getTypes({ strapi, nexus, config });
    const queries = getQueries({ strapi, nexus });
    const resolversConfig = getResolversConfig({ strapi });

    return {
      types: [types, queries],
      resolversConfig,
    };
  });
};
