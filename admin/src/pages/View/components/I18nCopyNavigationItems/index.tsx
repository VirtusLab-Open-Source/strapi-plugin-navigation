import React, { VFC } from "react";
import ConfirmationDialog from "../../../../components/ConfirmationDialog";
import { getMessage } from "../../../../utils";

export interface ConfirmEffect {
  (source: string): void;
}

export interface CancelEffect {
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
