import { Grid } from '@strapi/design-system';
import { useNotification } from '@strapi/strapi/admin';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';

import { getTrad } from '../../../../../translations';
import { Footer, FooterBase } from '../Footer';
import { CommonProps, ErrorState } from '../types';

interface Props extends ErrorState, CommonProps {}

export const ErrorDetails = ({ errors }: Props) => {
  const { formatMessage } = useIntl();

  const { toggleNotification } = useNotification();

  useEffect(() => {
    errors.map((error) => {
      toggleNotification({
        type: 'warning',
        message: formatMessage({ id: '', defaultMessage: error.message }),
      });
      console.error(error);
    });
  }, []);

  return (
    <Grid.Root>
      <Grid.Item col={12}>
        {formatMessage(getTrad('popup.navigation.manage.error.message'))}
      </Grid.Item>
    </Grid.Root>
  );
};

export const ErrorDetailsFooter: Footer = ({ onReset }) => {
  const { formatMessage } = useIntl();

  return (
    <FooterBase
      end={{
        children: formatMessage(getTrad('popup.navigation.manage.button.goBack')),
        onClick: onReset,
        variant: 'secondary',
      }}
    />
  );
};
