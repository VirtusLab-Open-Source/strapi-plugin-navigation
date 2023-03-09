import React, { useMemo } from 'react';
// @ts-ignore
import { HeaderLayout } from '@strapi/design-system/Layout';
// @ts-ignore
import { Stack } from '@strapi/design-system/Stack';
// @ts-ignore
import { Button } from '@strapi/design-system/Button';
// @ts-ignore
import Check from '@strapi/icons/Check';
// @ts-ignore
import { Select, Option } from '@strapi/design-system/Select';
// @ts-ignore
import { Box } from '@strapi/design-system/Box'
// @ts-ignore
import { Grid, GridItem } from "@strapi/design-system/Grid";
import { uniqBy } from 'lodash';
import { useNavigationManager } from '../../../../hooks/useNavigationManager';
import { getMessage } from '../../../../utils';
import { ToBeFixed } from '../../../../../../types';

const submitIcon = <Check />;
const pickDefaultLocaleNavigation = ({ activeNavigation, config }: ToBeFixed) => config.i18nEnabled
    ? activeNavigation
      ? activeNavigation.localeCode === config.defaultLocale
        ? activeNavigation
        : activeNavigation?.localizations.find(
            ({ localeCode }: { localeCode: string }) => localeCode === config.defaultLocale
          )
      : null
    : activeNavigation;

const NavigationHeader = ({
  activeNavigation,
  availableNavigations,
  structureHasErrors,
  structureHasChanged,
  handleChangeSelection,
  handleLocalizationSelection,
  handleSave,
  config,
}: ToBeFixed) => {
  const allLocaleVersions = useMemo(
    () =>
      activeNavigation?.localizations.length && config.i18nEnabled
        ? uniqBy([activeNavigation, ...(activeNavigation.localizations ?? [])].sort((a, b) => a.localeCode.localeCompare(b.localeCode)), 'id')
        : [],
    [activeNavigation, config]
  );
  const hasLocalizations = config.i18nEnabled && allLocaleVersions.length;
  const passedActiveNavigation = pickDefaultLocaleNavigation({ activeNavigation, config });
  const { openNavigationManagerModal, navigationManagerModal } = useNavigationManager()

  return (
    <HeaderLayout
      primaryAction={
        <Stack horizontal size={2}>
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
                  {getMessage('header.action.manage')}
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
                  style={null}
                >
                  {availableNavigations.map(({ id, name }: ToBeFixed) => <Option key={id} value={id}>{name}</Option>)}
                </Select>
              </GridItem>
            {hasLocalizations
              ? <GridItem col={2}>
                  <Select
                    type="select"
                    placeholder={getMessage('pages.main.header.localization.select.placeholder')}
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
                startIcon={submitIcon}
                disabled={structureHasErrors || !structureHasChanged}
                type="submit"
                fullWidth
                size="S"
              >
                {getMessage('submit.cta.save')}
              </Button>
            </GridItem>
            </Grid>
          </Box>
          {/* <MoreButton
              id="more"
              label="More"
              icon={<More />}
            /> */}
          {navigationManagerModal}
        </Stack>
      }
      title={getMessage('header.title', 'UI Navigation')}
      subtitle={getMessage('header.description', 'Define your portal navigation')}
    />
  );
};

export default NavigationHeader;
