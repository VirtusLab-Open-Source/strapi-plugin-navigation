import { Flex, Grid, Typography } from '@strapi/design-system';
import { prop } from 'lodash/fp';
import { useIntl } from 'react-intl';
import { getTrad } from '../../../../../translations';

import { Footer, FooterBase } from '../Footer';
import { CommonProps, Navigation, PurgeCacheState } from '../types';

interface Props extends PurgeCacheState, CommonProps {}

export const PurgeCacheConfirm = ({ navigations }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Grid.Root>
      <Grid.Item col={12} paddingBottom={1}>
        <Flex>
          <Typography variant="beta">
            {formatMessage(getTrad('popup.navigation.manage.purge.header'))}
          </Typography>
        </Flex>
      </Grid.Item>
      <Grid.Item col={12} paddingBottom={1}>
        <Typography variant="omega" fontWeight="semiBold">
          {renderItems(navigations)}
        </Typography>
      </Grid.Item>
    </Grid.Root>
  );
};

export const PurgeCacheConfirmFooter: Footer = ({ onSubmit, onReset, isLoading }) => {
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
        children: formatMessage(getTrad('popup.navigation.manage.footer.button.purge')),
        disabled: isLoading,
        onClick: onSubmit,
        variant: 'danger',
      }}
    />
  );
};

const renderItems = (navigations: Array<Navigation>) => navigations.map(prop('name')).join(', ');
