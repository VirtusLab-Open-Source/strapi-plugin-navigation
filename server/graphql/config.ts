import { StrapiContext } from "strapi-typed";
import { ICommonService } from "../../types";
import { getPluginService } from "../utils";

const getTypes = require("./types");
const getQueries = require("./queries");
const getResolversConfig = require("./resolvers-config");

export default async ({ strapi }: StrapiContext) => {
  const extensionService = strapi.plugin("graphql").service("extension");

  extensionService.shadowCRUD("plugin::navigation.audience").disable();
  extensionService.shadowCRUD("plugin::navigation.navigation").disable();
  extensionService.shadowCRUD("plugin::navigation.navigation-item").disable();
  extensionService
    .shadowCRUD("plugin::navigation.navigations-items-related")
    .disable();
  const commonService = getPluginService<ICommonService>('common');
  const pluginStore = await commonService.getPluginStore()
  const config = await pluginStore.get({ key: 'config' });

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
