import { useCallback, useMemo, useState } from 'react';

import { ConfirmEffect, I18nCopyNavigationItemsModal } from '../components/I18nCopyNavigationItems';

export const useI18nCopyNavigationItemsModal = (onConfirm: ConfirmEffect) => {
  const [isOpened, setIsOpened] = useState(false);
  const [sourceLocale, setSourceLocale] = useState<string | undefined>(undefined);
  const onCancel = useCallback(() => {
    setIsOpened(false);
  }, [setIsOpened]);
  const onConfirmWithModalClose = useCallback(() => {
    if (!sourceLocale) {
      return;
    }

    onConfirm(sourceLocale);
    setIsOpened(false);
  }, [onConfirm, sourceLocale]);

  const modal = useMemo(
    () =>
      isOpened ? (
        <I18nCopyNavigationItemsModal onConfirm={onConfirmWithModalClose} onCancel={onCancel} />
      ) : null,
    [isOpened, onConfirmWithModalClose, onCancel]
  );

  return useMemo(
    () => ({
      setI18nCopyModalOpened: setIsOpened,
      setI18nCopySourceLocale: setSourceLocale,
      i18nCopyItemsModal: modal,
      i18nCopySourceLocale: sourceLocale,
    }),
    [setSourceLocale, setIsOpened, modal, sourceLocale]
  );
};
