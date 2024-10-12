import { Button, Modal } from '@strapi/design-system';

import { NavigationSchema } from '../../../../../api/validators';
import { VoidEffect } from '../../../../../types';
import { SetState, State } from '../types';

interface FooterBaseProps {
  end?: ActionProps;
  start?: ActionProps;
}

export type Footer = React.FC<{
  navigations: Array<NavigationSchema>;
  onClose?: VoidEffect;
  onReset: VoidEffect;
  onSubmit: VoidEffect;
  setState: SetState;
  state: State;
  disabled?: boolean;
  isLoading: boolean;
}>;

interface ActionProps {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: VoidEffect;
  variant: 'danger' | 'secondary' | 'tertiary' | 'default';
}

export const FooterBase: React.FC<FooterBaseProps> = ({ start, end }) => {
  return (
    <Modal.Footer>
      <Modal.Close>{renderActions(start)}</Modal.Close>
      {renderActions(end)}
    </Modal.Footer>
  );
};

const renderActions = (actions: ActionProps | undefined): React.ReactNode =>
  actions ? (
    <Button onClick={actions.onClick} variant={actions.variant} disabled={actions.disabled}>
      {actions.children}
    </Button>
  ) : null;
