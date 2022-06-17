// @ts-ignore
import { Button } from "@strapi/design-system/Button";
// @ts-ignore
import { ModalFooter } from "@strapi/design-system/ModalLayout";
import React from "react";
import { VoidEffect } from "../../../../../../../types";
import { Navigation, SetState, State } from "../types";

interface FooterBaseProps {
  end?: ActionProps;
  start?: ActionProps;
}

export type Footer = React.FC<{
  navigations: Array<Navigation>;
  onClose?: VoidEffect;
  onReset: VoidEffect;
  onSubmit: VoidEffect;
  setState: SetState;
  state: State;
}>;

interface ActionProps {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: VoidEffect;
  variant: "danger" | "secondary" | "tertiary" | "default";
}

export const FooterBase: React.FC<FooterBaseProps> = ({ start, end }) => (
  <ModalFooter
    endActions={renderActions(end)}
    startActions={renderActions(start)}
  />
);

const renderActions = (actions: ActionProps | undefined): React.ReactNode =>
  actions ? (
    <Button
      onClick={actions.onClick}
      variant={actions.variant}
      disabled={actions.disabled}
    >
      {actions.children}
    </Button>
  ) : null;
