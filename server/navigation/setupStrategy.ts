import { IStrapi } from "strapi-typed";
import { INavigationSetupStrategy, Navigation } from "../../types";
import { i18nNavigationSetupStrategy } from "../i18n";
import { DEFAULT_NAVIGATION_ITEM, DEFAULT_POPULATE } from "../utils";

export const navigationSetupStrategy: INavigationSetupStrategy = async (
  context
) => {
  if (context.strapi.plugin("i18n")) {
    return await i18nNavigationSetupStrategy(context);
  } else {
    return await regularNavigationSetupStrategy(context);
  }
};

const regularNavigationSetupStrategy: INavigationSetupStrategy = async ({
  strapi,
}) => {
  const navigations = await getCurrentNavigations(strapi);

  if (!navigations.length) {
    return [
      await createNavigation({
        strapi,
        payload: {
          ...DEFAULT_NAVIGATION_ITEM,
        },
        populate: DEFAULT_POPULATE
      }),
    ];
  }

  return navigations;
};

// TODO: Move to service
const createNavigation = ({
  strapi,
  payload,
  populate
}: {
  strapi: IStrapi;
  payload: Partial<Navigation>;
  populate?: string[]
}): Promise<Navigation> =>
  strapi.query<Navigation>("plugin::navigation.navigation").create({
    data: {
      ...payload,
    },
    populate,
  });

const getCurrentNavigations = (strapi: IStrapi): Promise<Navigation[]> =>
  strapi.plugin("navigation").service("navigation").get();
