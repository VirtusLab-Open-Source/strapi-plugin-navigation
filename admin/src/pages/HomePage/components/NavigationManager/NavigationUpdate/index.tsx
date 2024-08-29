import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';

import { getTrad } from '../../../../../translations';
import { Effect } from '../../../../../types';
import { Footer, FooterBase } from '../Footer';
import { Form } from '../Form';
import { CommonProps, EditState, Navigation } from '../types';

interface Props extends EditState, CommonProps {}

export const NavigationUpdate = ({
  alreadyUsedNames,
  current,
  isLoading,
  navigation: initialValue,
  setState,
}: Props) => {
  const navigation: Navigation = useMemo(() => current ?? initialValue, [current]);

  const onChange: Effect<Navigation> = useCallback(
    (updated) => {
      setState({
        view: 'EDIT',
        alreadyUsedNames,
        current: updated,
        navigation: initialValue,
      });
    },
    [setState, initialValue, alreadyUsedNames]
  );

  return (
    <Form<Navigation>
      navigation={navigation}
      onChange={onChange}
      isLoading={isLoading}
      alreadyUsedNames={alreadyUsedNames}
    />
  );
};

export const NavigationUpdateFooter: Footer = ({ onSubmit, onReset, isLoading }) => {
  const { formatMessage } = useIntl();

  return (
    <FooterBase
      start={{
        children: formatMessage(getTrad('popup.item.form.button.cancel')),
        disabled: isLoading,
        onClick: onReset,
        variant: 'tertiary',
      }}
      end={{
        children: formatMessage(getTrad('popup.navigation.manage.button.save')),
        disabled: isLoading,
        onClick: onSubmit,
        variant: 'secondary',
      }}
    />
  );
};
