import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouteMatch } from "react-router-dom";
import { Id } from "strapi-typed";
import { Effect, Navigation } from "../../../types";
import pluginId from "../pluginId";
import { first, get, isNil } from 'lodash';
import { useQuery } from "react-query";
import { NavigationsRepository } from "../utils/repositories";
import { mapUseQueryResourceToState, resolvedResourceFor, ResourceState } from "../utils";
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
  const navigationItemPopUp = useNavigationItemPopup(); 
  const navigationConfig = useConfig();
  const navigations = useAvailableNavigations();
  const navigationIdToFetch =
    !isNil(activeId)
      ? activeId
      : navigations.state === ResourceState.RESOLVED
        ? get(first(navigations.value), "id", null)
        : null;
  
  const navigation = mapUseQueryResourceToState(
    useQuery<Navigation, Error, Navigation, [string, Id]>(
      [NavigationsRepository.getIndex(), navigationIdToFetch || 1],
      NavigationsRepository.fetchOne,
      {enabled: !isNil(navigationIdToFetch)}
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

    return resolvedResourceFor({
      ...navigation.value,
      items: prepareItemToViewPayload({
        config: navigationConfig.value,
        items: navigation.value.items,
      }),
    });
  }, [navigation.state, activeId, navigationConfig.state]);

  const handleChangeSelection = useCallback((id: Id) => {
    navigationItemPopUp.setNavigationItemPopupState(false);
    setActiveId(id);
  }, [activeId]);

  const handleChangeNavigationData = useCallback((payload: Navigation, forceClosePopups?: boolean) => {
    if (forceClosePopups) {
      navigationItemPopUp.setNavigationItemPopupState(false);
    }
    setChangedActiveNavigation(payload);
  }, [setChangedActiveNavigation]);

  const handleResetNavigationData = useCallback((forceClosePopups?: boolean) => {
    if (forceClosePopups) {
      navigationItemPopUp.setNavigationItemPopupState(false);
    }
    setChangedActiveNavigation(activeNavigation.state === ResourceState.RESOLVED ? activeNavigation.value : null);
  }, [setChangedActiveNavigation, activeNavigation.state]);

  const contextResource = activeNavigation.state === ResourceState.RESOLVED ?
    resolvedResourceFor({
      activeNavigation: activeNavigation.value,
      changedActiveNavigation: isNil(changedActiveNavigation) ? activeNavigation.value : changedActiveNavigation,
      handleChangeSelection,
      handleResetNavigationData,
      handleChangeNavigationData,
    }) : activeNavigation;

  return (
    <ActiveNavigationContext.Provider value={contextResource}>
      {children}
    </ActiveNavigationContext.Provider>
  );
}

export const useActiveNavigation = () => useContext(ActiveNavigationContext);