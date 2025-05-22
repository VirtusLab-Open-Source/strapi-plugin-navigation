import { useCallback } from 'react';
import { useIntl } from 'react-intl';

import { getTrad } from '../../../../../translations';
import { Footer, FooterBase } from '../Footer';
import { Form } from '../Form';
import { CommonProps, CreateState, Navigation, NewNavigation as NewNavigationType } from '../types';

interface Props extends CreateState, CommonProps {}

export const INITIAL_NAVIGATION = {
  name: '',
  items: [],
  visible: false,
} as unknown as Navigation;

export const NewNavigation = ({ setState, current, isLoading, alreadyUsedNames }: Props) => {
  const onSubmit = useCallback(
    ({ disabled, ...updated }: NewNavigationType & { disabled?: boolean }) => {
      setState({
        view: 'CREATE',
        current: updated,
        alreadyUsedNames,
        disabled,
      });
    },
    [setState]
  );

  return (
    <Form<NewNavigationType>
      alreadyUsedNames={alreadyUsedNames}
      navigation={current}
      onChange={onSubmit}
      isLoading={isLoading}
    />
  );
};

export const NewNavigationFooter: Footer = ({ onSubmit, onReset, disabled, isLoading }) => {
  const { formatMessage } = useIntl();

  return (
    <FooterBase
      start={{
        children: formatMessage(getTrad('popup.item.form.button.cancel')),
        variant: 'tertiary',
        disabled: isLoading,
        onClick: onReset,
      }}
      end={{
        children: formatMessage(getTrad('popup.navigation.manage.button.save')),
        variant: 'default',
        disabled: isLoading || disabled,
        onClick: onSubmit,
      }}
    />
  );
};
