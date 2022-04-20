import { IGraphQLSetupStrategy } from "../../types";
import handleConfig from "./config";

export const graphQLSetupStrategy: IGraphQLSetupStrategy = async ({
  strapi,
  config,
}) => {
  const hasGraphQLPlugin = !!strapi.plugin("graphql");

  if (hasGraphQLPlugin) {
    await handleConfig({ strapi, config });
  }
};
