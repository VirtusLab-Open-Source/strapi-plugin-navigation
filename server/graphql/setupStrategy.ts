import { IGraphQLSetupStrategy } from "../../types";
import handleConfig from "./config";

export const graphQLSetupStrategy: IGraphQLSetupStrategy = async ({
  strapi,
}) => {
  const hasGraphQLPlugin = !!strapi.plugin("graphql");

  if (hasGraphQLPlugin) {
    await handleConfig({ strapi });
  }
};
