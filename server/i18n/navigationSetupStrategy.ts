import { IStrapi, OnlyStrings, StrapiDBBulkActionResponse } from "strapi-typed";
import {
  assertEntity,
  assertNotEmpty,
  I18nLocale,
  INavigationSetupStrategy,
  Navigation,
  NavigationPluginConfig,
} from "../../types";
import { DEFAULT_NAVIGATION_ITEM, DEFAULT_POPULATE } from "../utils";
import { DefaultLocaleMissingError } from "./errors";
import { prop } from "lodash/fp";

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
        await createDefaultI18nNavigation({ strapi, defaultLocale }),
      ];
    }

    const noLocaleNavigations = currentNavigations.filter(hasNotAnyLocale);

    if (noLocaleNavigations.length) {
      await updateNavigations({
        strapi,
        ids: noLocaleNavigations.map(prop("id")).reduce((acc, id) => {
          if (id && Number(id)) {
            acc.push(Number(id));
          }

          return acc;
        }, [] as Array<number>),
        payload: {
          localeCode: defaultLocale,
        },
        populate: DEFAULT_POPULATE,
      });

      currentNavigations = await getCurrentNavigations(strapi);
    }

    const navigationsToProcess = currentNavigations.filter(
      ({ localeCode }) => defaultLocale === localeCode
    );

    for (const rootNavigation of navigationsToProcess) {
      let localizations = [
        ...(rootNavigation.localizations ?? []).map<Navigation>(
          (localization) => assertEntity(localization, "Navigation")
        ),
      ];

      const connectOrphans = currentNavigations.filter((navigation) => {
        return (
          navigation.slug.startsWith(rootNavigation.slug) &&
          navigation.id !== rootNavigation.id &&
          !localizations.find(({ id }) => navigation.id === id)
        );
      });

      localizations = localizations
        .concat([rootNavigation])
        .concat(connectOrphans)
        // hiding not supported locale versions
        .filter(
          ({ localeCode }) => !!localeCode && allLocale.includes(localeCode)
        );

      const missingLocale = allLocale.filter(
        (locale) =>
          !localizations.some(({ localeCode }) => localeCode === locale)
      );

      if (missingLocale.length) {
        const { ids } = await createNavigations({
          strapi,
          payloads: missingLocale.map((locale) => ({
            localeCode: locale,
            slug: `${rootNavigation.slug}-${locale}`,
            name: rootNavigation.name,
            visible: true,
          })),
        });

        localizations = [...(await getCurrentNavigations(strapi, ids))].concat([
          rootNavigation,
        ]);
      }

      // TODO: Update to bulk operation when strapi
      // allows to update `oneToMany` relations on bulk update
      for (const current of localizations) {
        await updateNavigation({
          strapi,
          current,
          payload: {
            localizations: localizations.filter(
              (localization) => localization.id !== current.id
            ),
          },
        });
      }
    }
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

    const remainingNavigations = await getCurrentNavigations(strapi);
    if (!remainingNavigations.length) {
      await createDefaultI18nNavigation({ strapi, defaultLocale });
    }
  }

  return getCurrentNavigations(strapi);
};

const getCurrentNavigations = (
  strapi: IStrapi,
  ids?: Array<number>
): Promise<Navigation[]> =>
  strapi.plugin("navigation").service("admin").get(ids);

// TODO: Move to service
const createNavigation = ({
  strapi,
  payload,
  populate,
}: {
  strapi: IStrapi;
  payload: Partial<Navigation>;
  populate?: Array<keyof Navigation>;
}): Promise<Navigation> =>
  strapi.query<Navigation>("plugin::navigation.navigation").create({
    data: {
      ...payload,
    },
    populate,
  });

// TODO: update strapi-typed
const createNavigations = ({
  strapi,
  payloads,
  populate,
}: {
  strapi: IStrapi;
  payloads: Array<Partial<Navigation>>;
  populate?: Array<keyof Navigation>;
}): Promise<any> =>
  strapi.query<Navigation>("plugin::navigation.navigation").createMany({
    data: payloads,
    populate,
  });

const updateNavigation = ({
  strapi,
  current,
  payload,
  populate,
}: {
  strapi: IStrapi;
  payload: Partial<Navigation>;
  current: Navigation;
  populate?: Array<OnlyStrings<keyof Navigation>>;
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

const updateNavigations = ({
  strapi,
  ids,
  payload,
  populate,
}: {
  strapi: IStrapi;
  payload: Partial<Navigation>;
  ids: Array<number>;
  populate?: Array<OnlyStrings<keyof Navigation>>;
}): Promise<StrapiDBBulkActionResponse> =>
  strapi.query<Navigation>("plugin::navigation.navigation").updateMany({
    data: payload,
    populate,
    where: {
      id: {
        $in: ids,
      },
    },
  });

// TODO: Move to service
const deleteNavigations = ({
  strapi,
  where,
}: {
  strapi: IStrapi;
  where: { localeCode?: string | { $in: string[] } | { $not: string } };
}) =>
  strapi.query<Navigation>("plugin::navigation.navigation").deleteMany({
    where,
  });

const createDefaultI18nNavigation = ({
  strapi,
  defaultLocale,
}: {
  strapi: IStrapi;
  defaultLocale: string;
}): Promise<Navigation> =>
  createNavigation({
    strapi,
    payload: {
      ...DEFAULT_NAVIGATION_ITEM,
      localeCode: defaultLocale,
    },
    populate: DEFAULT_POPULATE,
  });
