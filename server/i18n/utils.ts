import { IStrapi } from "strapi-typed";
import { NavigationConfig } from "../../types";

type GetI18nStatusInput = {
  strapi: IStrapi;
};

type I18NStatus = {
  hasI18NPlugin: boolean;
  enabled: boolean;
  defaultLocale?: string | null;
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

  const config: NavigationConfig = await pluginStore.get({
    key: "config",
  });
  const localeService = i18nPlugin ? i18nPlugin.service("locales") : null;
  const defaultLocale: string | undefined = await localeService?.getDefaultLocale();

  return hasI18NPlugin
    ? {
        hasI18NPlugin,
        enabled: config.i18nEnabled,
        defaultLocale,
      }
    : {
        hasI18NPlugin,
        enabled: false,
        defaultLocale: undefined,
      };
};
