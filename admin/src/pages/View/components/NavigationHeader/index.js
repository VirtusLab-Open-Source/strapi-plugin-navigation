import React from 'react';
import { useIntl } from 'react-intl';
import { HeaderLayout } from '@strapi/design-system/Layout';
import { Stack } from '@strapi/design-system/Stack';
import { Button } from '@strapi/design-system/Button';
import { IconButton } from '@strapi/design-system/IconButton';
import Check from '@strapi/icons/Check';
import More from '@strapi/icons/More';
import styled from 'styled-components';
import { getTrad } from '../../../../translations';
import { transformToRESTPayload } from '../../utils/parsers';
const MoreButton = styled(IconButton)`
  margin: ${({ theme }) => `0 ${theme.spaces[2]}`};
  padding: ${({ theme }) => theme.spaces[2]};

  svg {
    width: ${18 / 16}rem;
    height: ${18 / 16}rem;
  }
`;

const NavigationHeader = ({
  structureHasErrors,
  isLoadingForSubmit,
  handleSubmitNavigation,
  handleSave,
}) => {
  const { formatMessage } = useIntl();

  return (
    <HeaderLayout
        primaryAction={
          <Stack horizontal size={2}>
            <Button
              onClick={handleSave}
              startIcon={<Check />}
              disabled={structureHasErrors}
              type="submit"
            >
              {formatMessage(getTrad('submit.cta.save'))}
            </Button>
            <MoreButton
              id="more"
              label="More"
              icon={<More />}
            />
          </Stack>
        }
        title={formatMessage({
          id: getTrad('header.title'),
          defaultMessage: 'UI Navigation',
        })}
        subtitle={formatMessage({
          id: getTrad('header.description'),
          defaultMessage: 'Define your portal navigation',
        })}
      />
  );
};

export default NavigationHeader;
