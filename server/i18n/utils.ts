import { IStrapi } from "strapi-typed";
import { NavigationPluginConfig } from "../../types";
import { prop } from "lodash/fp";

type GetI18nStatusInput = {
  strapi: IStrapi;
};

type I18NStatus = {
  hasI18NPlugin: boolean;
  enabled: boolean;
  defaultLocale?: string | null;
  locales?: string[] | undefined
};

export const getI18nStatus = async ({
  strapi,
}: GetI18nStatusInput): Promise<I18NStatus> => {
  const i18nPlugin: null | any = strapi.plugin("i18n")
  const hasI18NPlugin = !!i18nPlugin;
  const pluginStore = strapi.store({
    type: "plugin",
    name: "navigation",
  });

  const config: NavigationPluginConfig = await pluginStore.get({
    key: "config",
  });
  const localeService = i18nPlugin ? i18nPlugin.service("locales") : null;
  const defaultLocale: string | undefined = await localeService?.getDefaultLocale();
  const locales: string[] | undefined = (await localeService?.find({}))?.map(prop("code"));

  return hasI18NPlugin
    ? {
        hasI18NPlugin,
        enabled: config.i18nEnabled,
        defaultLocale,
        locales,
      }
    : {
        hasI18NPlugin,
        enabled: false,
        defaultLocale: undefined,
        locales: undefined
      };
};
