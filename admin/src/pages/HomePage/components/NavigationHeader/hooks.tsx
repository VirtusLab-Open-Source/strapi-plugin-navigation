import { useCallback, useMemo, useState } from 'react';
import { NavigationManager } from '../NavigationManager';

export const useNavigationManager = () => {
  const [isOpened, setIsOpened] = useState(false);
  const open = useCallback(() => setIsOpened(true), [setIsOpened]);
  const close = useCallback(() => setIsOpened(false), [setIsOpened]);

  const modal = useMemo(
    () =>
      isOpened ? (
        <NavigationManager initialState={{ view: 'INITIAL' }} isOpened onClose={close} />
      ) : null,
    [isOpened, close]
  );

  return useMemo(
    () => ({
      navigationManagerModal: modal,
      openNavigationManagerModal: open,
      closeNavigationManagerModal: close,
    }),
    [modal, open, close]
  );
};
