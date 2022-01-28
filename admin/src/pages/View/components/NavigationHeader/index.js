import React from 'react';
import { useIntl } from 'react-intl';
import { HeaderLayout } from '@strapi/design-system/Layout';
import { Stack } from '@strapi/design-system/Stack';
import { Button } from '@strapi/design-system/Button';
import Check from '@strapi/icons/Check';
import More from '@strapi/icons/More';
import { getTrad } from '../../../../translations';
import { MoreButton } from './styles';


const NavigationHeader = ({
  structureHasErrors,
  structureHAsChanged,
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
              disabled={structureHasErrors || !structureHAsChanged}
              type="submit"
            >
              {formatMessage(getTrad('submit.cta.save'))}
            </Button>
            {/* <MoreButton
              id="more"
              label="More"
              icon={<More />}
            /> */}
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
