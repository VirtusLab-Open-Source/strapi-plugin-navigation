import { Nexus } from "../../types";

type RenderNavigationArgsEnhancer<T> = {
  previousArgs: T;
  nexus: Nexus;
};

export const addI18NRenderNavigationArgs = <T>({
  previousArgs,
  nexus,
}: RenderNavigationArgsEnhancer<T>) => ({
  ...previousArgs,
  locale: nexus.stringArg(),
});
