import { useQuery } from "react-query";
import { NavigationsRepository } from "../utils/repositories";
import { assertNotEmpty, Navigation } from "../../../types";
import {
  mapUseQueryResourceToState,
  resolvedResourceFor,
  ResourceState,
} from "../utils";
import { useMemo } from "react";
import useConfig from "./useConfig";

export const useAvailableNavigations = (): ResourceState<
  Navigation[],
  Error | null
> => {
  const navigations = mapUseQueryResourceToState(
    useQuery<Navigation[], Error>(NavigationsRepository.getIndex(), NavigationsRepository.fetch)
  );
  const navigationConfig = useConfig();
  const successState = useMemo(
    () => {
      return (
        navigationConfig.state === ResourceState.RESOLVED &&
        navigations.state === ResourceState.RESOLVED
          ? navigationConfig.value.i18nEnabled
            ? resolvedResourceFor(
                navigations.value.filter(
                  ({ localeCode }: Navigation) =>
                    localeCode === navigationConfig.value.defaultLocale
                )
              )
            : navigations
          : null
      )
    },
    [navigations, navigationConfig]
  );

  if (navigationConfig.state !== ResourceState.RESOLVED) {
    return navigationConfig;
  }

  if (navigations.state !== ResourceState.RESOLVED) {
    return navigations;
  }

  assertNotEmpty(successState);

  return successState;
};
