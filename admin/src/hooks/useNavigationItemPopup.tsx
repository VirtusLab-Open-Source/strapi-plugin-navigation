import { always } from "lodash/fp";
import React, { createContext, useContext, useMemo, useState } from "react";
import { VoidEffect } from "../../../types";

interface INavigationItemPopupContext {
  isPopupOpen: boolean;
  openPopup: VoidEffect,
  closePopup: VoidEffect,
}

const NavigationItemPopupContext = createContext<INavigationItemPopupContext>({
  openPopup: always(null),
  closePopup: always(null),
  isPopupOpen: false,
});

export const NavigationItemPopupProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isOpened, setIsOpened] = useState(false);

  const contextValue = useMemo<INavigationItemPopupContext>(() => ({
    isPopupOpen: isOpened,
    openPopup: () => setIsOpened(true),
    closePopup: () => setIsOpened(false),
  }), [isOpened]);

  return (
    <NavigationItemPopupContext.Provider value={contextValue}>
      {children}
    </NavigationItemPopupContext.Provider>
  );
}

export const useNavigationItemPopup = () => useContext(NavigationItemPopupContext);