import { Box, Flex, Grid, Typography } from '@strapi/design-system';

import { useIntl } from 'react-intl';

import { BOX_DEFAULT_PROPS } from '../../common';
import { getTrad } from '../../../../translations';
import { PreferCustomContentTypesField } from './PreferCustomContentTypeField';
import { ContentTypesField } from './ContentTypesField';
import { DefaultContentTypeField } from './DefaultContentTypeField';
import { ContentTypesSettings } from './ContentTypesSettings';

export const GeneralSettingsPanel = () => {
  const { formatMessage } = useIntl();

  return (
    <Box {...BOX_DEFAULT_PROPS} width="100%">
      <Flex direction="column" alignItems="flex-start" gap={2}>
        <Typography variant="delta" as="h2">
          {formatMessage(getTrad('pages.settings.general.title'))}
        </Typography>

        <Grid.Root gap={4} width="100%">
          <Grid.Item col={12} s={12} xs={12}>
            <Grid.Root gap={4} width="100%">
              <PreferCustomContentTypesField />
              <ContentTypesField />
              <DefaultContentTypeField />
              <ContentTypesSettings />
            </Grid.Root>
          </Grid.Item>
        </Grid.Root>
      </Flex>
    </Box>
  );
};
