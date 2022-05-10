import { Nexus } from "../../types";

// TODO: Find a way to get this key from the source plugin
const LOCALE_SCALAR_TYPENAME = 'I18NLocaleCode';

type RenderNavigationArgsEnhancer<T> = {
  previousArgs: T;
  nexus: Nexus;
};

export const addI18NRenderNavigationArgs = <T>({
  previousArgs,
  nexus,
}: RenderNavigationArgsEnhancer<T>) => ({
  ...previousArgs,
  locale: nexus.arg({ type: LOCALE_SCALAR_TYPENAME }),
});
