import React, { createContext, useContext, useMemo, useState } from "react";
import { Effect } from "../../../types";

interface INavigationItemPopupContext {
  isNavigationItemPopupOpened: boolean;
  setNavigationItemPopupState: Effect<boolean>;
}

const NavigationItemPopupContext = createContext<INavigationItemPopupContext>({
  setNavigationItemPopupState: () => null,
  isNavigationItemPopupOpened: false,
});

// TODO: [@ltsNotMike] Change name to something connected to isActivePopup
export const NavigationItemPopupProvider: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const [isOpened, setIsOpened] = useState(false);

  const contextValue = useMemo<INavigationItemPopupContext>(() => ({
    isNavigationItemPopupOpened: isOpened,
    setNavigationItemPopupState: setIsOpened,
  }), [isOpened]);

  return (
    <NavigationItemPopupContext.Provider value={contextValue}>
      {children}
    </NavigationItemPopupContext.Provider>
  );
}

export const useNavigationItemPopup = () => useContext(NavigationItemPopupContext);