import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouteMatch } from "react-router-dom";
import { Id } from "strapi-typed";
import { Effect, Navigation } from "../../../types";
import pluginId from "../pluginId";
import { first, get, isNil } from 'lodash';
import { useQuery } from "react-query";
import { NavigationsRepository } from "../utils/repositories";
import { errorStatusResourceFor, mapUseQueryResourceToState, resolvedResourceFor, ResourceState } from "../utils";
import useConfig from "./useConfig";
import { prepareItemToViewPayload } from '../utils/functions';
import { useAvailableNavigations } from "./useAvailableNavigations";
import { useNavigationItemPopup } from "./useNavigationItemPopup";
interface IActiveNavigationContext {
  activeNavigation: Navigation;
  changedActiveNavigation: Navigation | null;
  handleChangeSelection: Effect<Id>;
  handleResetNavigationData: Effect<boolean | undefined>;
  handleChangeNavigationData: (payload: Navigation, forceClosePopups?: boolean) => void;
}

const ActiveNavigationContext = createContext<ResourceState<IActiveNavigationContext>>({
  state: ResourceState.LOADING,
});

export const ActiveNavigationProvider: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const menuViewMatch = useRouteMatch(`/plugins/${pluginId}/:id`);
  const routeMatchId = get(menuViewMatch, "params.id", null);
  const [activeId, setActiveId] = useState<Id>(routeMatchId);
  const { closePopup } = useNavigationItemPopup();
  const navigationConfig = useConfig();
  const navigations = useAvailableNavigations();
  const navigationIdToFetch =
    !isNil(activeId)
      ? activeId
      : navigations.state === ResourceState.RESOLVED
        ? get(first(navigations.value), "id", null)
        : null;

  const navigation = mapUseQueryResourceToState(
    useQuery<Navigation | null, Error, Navigation, [string, Id | null]>(
      [NavigationsRepository.getIndex(), navigationIdToFetch],
      NavigationsRepository.fetchOne,
      { enabled: !isNil(navigationIdToFetch) }
    )
  );
  const [changedActiveNavigation, setChangedActiveNavigation] = useState<Navigation | null>(null);

  const activeNavigation: ResourceState<Navigation> = useMemo(() => {
    if (navigationConfig.state !== ResourceState.RESOLVED) {
      return navigationConfig;
    }
    if (navigation.state !== ResourceState.RESOLVED) {
      return navigation;
    }
    if (activeId === null && navigations.state !== ResourceState.RESOLVED) {
      return navigations;
    }
    if (navigation.value === null) {
      return errorStatusResourceFor(Error("Navigation could not be loaded"));
    }

    const newActiveNavigation = {
      ...navigation.value,
      items: prepareItemToViewPayload({
        config: navigationConfig.value,
        items: navigation.value.items,
      }),
    }

    setChangedActiveNavigation(newActiveNavigation);
    return resolvedResourceFor(newActiveNavigation);
  }, [navigation, navigations, activeId, navigationConfig.state]);

  const handleChangeSelection = useCallback((id: Id) => {
    closePopup();
    setActiveId(id);
  }, [activeId, closePopup]);

  const handleChangeNavigationData = useCallback((payload: Navigation, forceClosePopups?: boolean) => {
    if (forceClosePopups) {
      closePopup();
    }
    setChangedActiveNavigation(payload);
  }, [setChangedActiveNavigation, closePopup]);

  const handleResetNavigationData = useCallback((forceClosePopups?: boolean) => {
    if (forceClosePopups) {
      closePopup();
    }
    setChangedActiveNavigation(activeNavigation.state === ResourceState.RESOLVED ? activeNavigation.value : null);
  }, [setChangedActiveNavigation, activeNavigation.state]);

  const contextResource = useMemo(() => activeNavigation.state === ResourceState.RESOLVED ?
    resolvedResourceFor({
      activeNavigation: activeNavigation.value,
      changedActiveNavigation: isNil(changedActiveNavigation) ? activeNavigation.value : changedActiveNavigation,
      handleChangeSelection,
      handleResetNavigationData,
      handleChangeNavigationData,
    }) : activeNavigation, [activeNavigation, changedActiveNavigation, handleChangeSelection, handleResetNavigationData, handleChangeNavigationData]);

  return (
    <ActiveNavigationContext.Provider value={contextResource}>
      {children}
    </ActiveNavigationContext.Provider>
  );
}

export const useActiveNavigation = () => useContext(ActiveNavigationContext);