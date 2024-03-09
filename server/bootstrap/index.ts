import { StrapiContext } from "strapi-typed";
import permissions from "../../permissions";
import {
  IConfigSetupStrategy,
  IGraphQLSetupStrategy,
  INavigationSetupStrategy,
  IRestCacheSetupStrategy,
} from "../../types";
import { graphQLSetupStrategy } from "../graphql";
import { navigationSetupStrategy } from "../navigation";
import { configSetupStrategy } from "../config";
import { setupCacheStrategy } from "../cache";

export = async ({ strapi }: StrapiContext) => {
  assertUserPermissionsAvailability({ strapi });

  await setupPermissions({ strapi });
  await setupConfig({ strapi });
  await setupGraphQL({ strapi });
  await setupNavigation({ strapi });
  await setupCache({ strapi });
};

const assertUserPermissionsAvailability = ({ strapi }: StrapiContext) => {
  if (!strapi.plugin("users-permissions")) {
    throw new Error(
      "In order to make the navigation plugin work the users-permissions plugin is required"
    );
  }
};
const setupGraphQL: IGraphQLSetupStrategy = graphQLSetupStrategy;
const setupNavigation: INavigationSetupStrategy = navigationSetupStrategy;
const setupConfig: IConfigSetupStrategy = configSetupStrategy;
const setupCache: IRestCacheSetupStrategy = setupCacheStrategy;
const setupPermissions = async ({ strapi }: StrapiContext) => {
  // Add permissions
  const actions = [
    {
      section: "plugins",
      displayName: "Read",
      uid: permissions.navigation.read,
      pluginName: "navigation",
    },
    {
      section: "plugins",
      displayName: "Update",
      uid: permissions.navigation.update,
      pluginName: "navigation",
    },
    {
      section: "plugins",
      displayName: "Settings",
      uid: permissions.navigation.settings,
      pluginName: "navigation",
    },
  ];
  await strapi.admin.services.permission.actionProvider.registerMany(actions);
};
