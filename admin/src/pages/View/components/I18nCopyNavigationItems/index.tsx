import React, { useCallback, useMemo, useState, VFC } from "react";
import ConfirmationDialog from "../../../../components/ConfirmationDialog";
import { getMessage } from "../../../../utils";

interface ConfirmEffect {
  (source: string): void;
}

interface CancelEffect {
  (): void;
}

interface Props {
  onConfirm: ConfirmEffect;
  onCancel: CancelEffect;
}

const refreshIcon = <></>;

export const I18nCopyNavigationItemsModal: VFC<Props> = ({
  onConfirm,
  onCancel,
}) => {
  return (
    <ConfirmationDialog
      isVisible
      header={getMessage(
        "pages.view.actions.i18nCopyItems.confirmation.header"
      )}
      labelConfirm={getMessage(
        "pages.view.actions.i18nCopyItems.confirmation.confirm"
      )}
      iconConfirm={refreshIcon}
      mainIcon={refreshIcon}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      {getMessage("pages.view.actions.i18nCopyItems.confirmation.content")}
    </ConfirmationDialog>
  );
};

export const useI18nCopyNavigationItemsModal = (onConfirm: ConfirmEffect) => {
  const [isOpened, setIsOpened] = useState(false);
  const [sourceLocale, setSourceLocale] = useState<string | undefined>(
    undefined
  );
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
        <I18nCopyNavigationItemsModal
          onConfirm={onConfirmWithModalClose}
          onCancel={onCancel}
        />
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
