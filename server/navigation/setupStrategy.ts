import { IStrapi, StrapiPlugin } from "strapi-typed";
import { IAdminService, INavigationSetupStrategy, Navigation } from "../../types";
import { i18nNavigationSetupStrategy } from "../i18n";
import { DEFAULT_NAVIGATION_ITEM, DEFAULT_POPULATE, getPluginService } from "../utils";

export const navigationSetupStrategy: INavigationSetupStrategy = async (
  context
) => {
  const i18nPlugin: StrapiPlugin | undefined = context.strapi.plugin("i18n");
  const defaultLocale: string | null = i18nPlugin ? await i18nPlugin.service("locales").getDefaultLocale() : null;

  if (defaultLocale) {
    return await i18nNavigationSetupStrategy(context);
  } else {
    return await regularNavigationSetupStrategy(context);
  }
};

const regularNavigationSetupStrategy: INavigationSetupStrategy = async ({
  strapi,
}) => {
  const navigations = await getCurrentNavigations();

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
  populate?: (keyof Navigation)[]
}): Promise<Navigation> =>
  strapi.query<Navigation>("plugin::navigation.navigation").create({
    data: {
      ...payload,
    },
    populate,
  });

const getCurrentNavigations = (): Promise<Navigation[]> =>
  getPluginService<IAdminService>('admin').get();
