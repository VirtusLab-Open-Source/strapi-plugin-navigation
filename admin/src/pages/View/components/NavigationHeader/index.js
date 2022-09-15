import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { HeaderLayout } from '@strapi/design-system/Layout';
import { Stack } from '@strapi/design-system/Stack';
import { Button } from '@strapi/design-system/Button';
import { getTrad } from '../../../../translations';
import { MoreButton } from './styles';
import { Select, Option } from '@strapi/design-system/Select';
import { Box } from '@strapi/design-system/Box'
import { Grid, GridItem } from "@strapi/design-system/Grid";
import { uniqBy } from 'lodash';
import { useNavigationManager } from '../../../../hooks/useNavigationManager';
import useDataManager from '../../../../hooks/useDataManager';
import { useAvailableNavigations } from '../../../../hooks/useAvailableNavigations';
import { ResourceState } from '../../../../utils';
import { checkIcon } from '../../../../components/icons';

const pickDefaultLocaleNavigation = ({ activeNavigation, config }) => config.i18nEnabled
  ? activeNavigation
    ? activeNavigation.localeCode === config.defaultLocale
      ? activeNavigation
      : activeNavigation?.localizations.find(
        ({ localeCode }) => localeCode === config.defaultLocale
      )
    : null
  : activeNavigation;

const NavigationHeader = ({
  structureHasErrors,
  structureHasChanged,
  handleChangeSelection,
  handleSave,
  config,
}) => {
  const { formatMessage } = useIntl();
  const {
    activeItem: activeNavigation,
    handleLocalizationSelection,
  } = useDataManager();

  const availableNavigations = useAvailableNavigations();

  const allLocaleVersions = useMemo(
    () =>
      activeNavigation?.localizations.length && config.i18nEnabled
        ? uniqBy([activeNavigation, ...(activeNavigation.localizations ?? [])].sort((a, b) => a.localeCode.localeCompare(b.localeCode)), 'id')
        : [],
    [activeNavigation, config]
  );
  const hasLocalizations = config.i18nEnabled && allLocaleVersions.length;
  const passedActiveNavigation = pickDefaultLocaleNavigation({ activeNavigation, config });
  const { closeNavigationManagerModal, openNavigationManagerModal, navigationManagerModal } = useNavigationManager()

  return (
    <HeaderLayout
      primaryAction={
        <Stack horizontal spacing={2}>
          <Box width="27vw" marginRight="8px">
            <Grid gap={4}>
              {!hasLocalizations ? (<GridItem col={2} />) : null}
              <GridItem col={3}>
                <Button
                  onClick={openNavigationManagerModal}
                  startIcon={null}
                  type="button"
                  variant="secondary"
                  fullWidth
                  size="S"
                >
                  {formatMessage(getTrad('header.action.manage'))}
                </Button>
              </GridItem>
              <GridItem col={4}>
                <Select
                  type="select"
                  placeholder="Change navigation"
                  name="navigationSelect"
                  onChange={handleChangeSelection}
                  value={passedActiveNavigation?.id}
                  size="S"
                  disabled={availableNavigations.state !== ResourceState.RESOLVED}
                >
                  {
                    availableNavigations.state === ResourceState.RESOLVED && availableNavigations.value.map(({ id, name }) => <Option key={id} value={id}>{name}</Option>)
                  }
                </Select>
              </GridItem>
              {hasLocalizations
                ? <GridItem col={2}>
                  <Select
                    type="select"
                    placeholder={formatMessage(getTrad('pages.main.header.localization.select.placeholder'))}
                    name="navigationLocalizationSelect"
                    onChange={handleLocalizationSelection}
                    value={activeNavigation?.id}
                    size="S"
                  >
                    {allLocaleVersions.map(({ id, localeCode }) => <Option key={id} value={id}>{localeCode}</Option>)}
                  </Select>
                </GridItem>
                : null
              }
              <GridItem col={3}>
                <Button
                  onClick={handleSave}
                  startIcon={checkIcon}
                  disabled={structureHasErrors || !structureHasChanged}
                  type="submit"
                  fullWidth
                  size="S"
                >
                  {formatMessage(getTrad('submit.cta.save'))}
                </Button>
              </GridItem>
            </Grid>
          </Box>
          {/* <MoreButton
              id="more"
              label="More"
              icon={moreIcon}
            /> */}
          {/* {navigationManagerModal} */}
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
