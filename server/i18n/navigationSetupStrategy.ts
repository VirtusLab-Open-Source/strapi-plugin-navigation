import { IStrapi } from "strapi-typed";
import {
  assertEntity,
  assertNotEmpty,
  I18nLocale,
  INavigationSetupStrategy,
  Navigation,
  NavigationPluginConfig,
} from "../../types";
import {
  DEFAULT_NAVIGATION_ITEM,
  DEFAULT_NAVIGATION_POPULATED_FIELDS,
} from "../common";
import { DefaultLocaleMissingError } from "./errors";

export const i18nNavigationSetupStrategy: INavigationSetupStrategy = async ({
  strapi,
}) => {
  const pluginStore = strapi.store({
    type: "plugin",
    name: "navigation",
  });
  const config: NavigationPluginConfig = await pluginStore.get({
    key: "config",
  });
  let currentNavigations = await getCurrentNavigations(strapi);
  const localeService = strapi.plugin("i18n").service("locales");
  const defaultLocale: string | null = await localeService.getDefaultLocale();
  const allLocale: string[] = (await localeService.find({})).map(
    ({ code }: I18nLocale) => code
  );

  assertNotEmpty(defaultLocale, new DefaultLocaleMissingError());

  if (config.i18nEnabled) {
    const hasNotAnyLocale = ({ localeCode }: Navigation) => !localeCode;

    if (currentNavigations.length === 0) {
      currentNavigations = [
        await createNavigation({
          strapi,
          payload: {
            ...DEFAULT_NAVIGATION_ITEM,
            localeCode: defaultLocale,
          },
          populate: DEFAULT_NAVIGATION_POPULATED_FIELDS,
        }),
      ];
    }

    if (currentNavigations.some(hasNotAnyLocale)) {
      currentNavigations = await Promise.all(
        currentNavigations.map(async (navigation) => {
          return hasNotAnyLocale(navigation)
            ? await updateNavigation({
                strapi,
                current: navigation,
                payload: {
                  localeCode: defaultLocale,
                },
                populate: DEFAULT_NAVIGATION_POPULATED_FIELDS,
              })
            : navigation;
        })
      );
    }

    await Promise.all(
      currentNavigations
        .filter(({ localeCode }) => defaultLocale === localeCode)
        .flatMap(async (rootNavigation) => {
          const localizations = [
            ...(rootNavigation.localizations ?? []).map<Navigation>(
              (localization) => assertEntity(localization, "Navigation")
            ),
            rootNavigation,
          ];

          for (const locale of allLocale) {
            if (
              !localizations.some(({ localeCode }) => localeCode === locale)
            ) {
              localizations.push(
                await createNavigation({
                  strapi,
                  payload: {
                    localeCode: locale,
                    slug: `${rootNavigation.slug}-${locale}`,
                    name: rootNavigation.name,
                    visible: true,
                  },
                })
              );
            }
          }

          return await Promise.all(
            localizations.map((current) =>
              updateNavigation({
                strapi,
                current,
                payload: {
                  localizations: localizations.filter(
                    ({ id }) => id !== current.id
                  ),
                },
              })
            )
          );
        })
    );
  } else {
    if (config.pruneObsoleteI18nNavigations) {
      await deleteNavigations({
        strapi,
        where: { localeCode: { $not: defaultLocale } as any },
      });
      await pluginStore.set({
        key: "config",
        value: {
          ...config,
          pruneObsoleteI18nNavigations: false,
        },
      });
    }
  }

  return getCurrentNavigations(strapi);
};

const getCurrentNavigations = (strapi: IStrapi): Promise<Navigation[]> =>
  strapi.plugin("navigation").service("admin").get();

// TODO: Move to service
const createNavigation = ({
  strapi,
  payload,
  populate,
}: {
  strapi: IStrapi;
  payload: Partial<Navigation>;
  populate?: string[];
}): Promise<Navigation> =>
  strapi.query<Navigation>("plugin::navigation.navigation").create({
    data: {
      ...payload,
    },
    populate,
  });

// TODO: Move to service
const updateNavigation = ({
  strapi,
  current,
  payload,
  populate,
}: {
  strapi: IStrapi;
  payload: Partial<Navigation>;
  current: Navigation;
  populate?: string[];
}): Promise<Navigation> =>
  strapi.query<Navigation>("plugin::navigation.navigation").update({
    data: {
      ...payload,
    },
    populate,
    where: {
      id: current.id,
    },
  });

// TODO: Move to service
const deleteNavigations = ({
  strapi,
  where,
}: {
  strapi: IStrapi;
  where: { localeCode?: string | { $in: string[] } | { $not: string } };
}): Promise<Navigation[]> =>
  strapi.query<Navigation>("plugin::navigation.navigation").deleteMany({
    where,
  });
