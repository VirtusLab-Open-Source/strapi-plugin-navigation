import { useQuery, useQueryClient } from "react-query";
// @ts-ignore
import { useNotification } from "@strapi/helper-plugin";
import { getTrad } from "../translations";
import {
  assertNotEmpty,
  Effect,
  NavigationRawConfig,
  NavigationSettingsConfig,
  VoidEffect,
} from "../../../types";
import {
  mapUseQueryResourceToState,
  resolvedResourceFor,
  ResourceState,
  restartStrapi,
} from "../utils";
import { NavigationConfigRepository } from "../utils/repositories";
import { useCallback, useMemo } from "react";

type MutationType = "submit" | "restore" | "restart";
type SettingsConfigResponse = {
  config: NavigationSettingsConfig;
  submitConfig: Effect<NavigationRawConfig>;
  restoreConfig: VoidEffect;
  restartStrapi: VoidEffect;
};

const useSettingsConfig = (): ResourceState<
  SettingsConfigResponse,
  Error | null
> => {
  const queryClient = useQueryClient();
  const toggleNotification = useNotification();
  const navigationConfig = mapUseQueryResourceToState(
    useQuery<NavigationSettingsConfig, Error | null>(
      NavigationConfigRepository.getIndex(),
      NavigationConfigRepository.fetchViaSettings,
    )
  );

  const handleError = useCallback(
    (type: MutationType) => {
      toggleNotification({
        type: "warning",
        message: getTrad(`pages.settings.notification.${type}.error`),
      });
    },
    [toggleNotification, getTrad]
  );

  const handleSuccess = useCallback(
    async (type: MutationType) => {
      await queryClient.invalidateQueries(
        NavigationConfigRepository.getIndex()
      );
      toggleNotification({
        type: "success",
        message: getTrad(`pages.settings.notification.${type}.success`),
      });
    },
    [queryClient, toggleNotification, getTrad]
  );

  const submitConfig = useCallback(
    async (body: NavigationRawConfig) => {
      try {
        await NavigationConfigRepository.update(body);
        await handleSuccess("submit");
      } catch (e) {
        handleError("submit");
      }
    },
    [handleSuccess, handleError]
  );

  const restoreConfig = useCallback(async () => {
    try {
      await NavigationConfigRepository.restore();
      await handleSuccess("restore");
    } catch (e) {
      handleError("restore");
    }
  }, [handleSuccess, handleError]);

  const restartStrapiMutation = useCallback(async () => {
    try {
      await restartStrapi();
      await handleSuccess("restart");
    } catch (e) {
      handleError("restart");
    }
  }, [restartStrapi, handleSuccess, handleError]);

  const successState = useMemo(
    () =>
      navigationConfig.state === ResourceState.RESOLVED
        ? resolvedResourceFor({
            config: navigationConfig.value,
            submitConfig,
            restoreConfig,
            restartStrapi: restartStrapiMutation,
          })
        : null,
    [navigationConfig, submitConfig, restoreConfig, restartStrapiMutation]
  );

  if (navigationConfig.state !== ResourceState.RESOLVED) {
    return navigationConfig;
  }

  assertNotEmpty(successState);

  return successState;
};

export default useSettingsConfig;
