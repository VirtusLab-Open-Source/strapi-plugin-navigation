import { Button, Flex, Link, SingleSelect, SingleSelectOption, Tag } from '@strapi/design-system';
import { ArrowLeft, Check, Feather, Information } from '@strapi/icons';
import { Layouts } from '@strapi/strapi/admin';
import React from 'react';
import { useIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';
import { NavigationSchema } from '../../../../api/validators';
import { PLUGIN_ID } from '../../../../pluginId';
import { getTrad } from '../../../../translations';
import { Effect } from '../../../../types';
import { useConfig, usePluginMediaQuery } from '../../hooks';

const submitIcon = <Check />;

interface Props {
  activeNavigation?: NavigationSchema;
  structureHasErrors?: boolean;
  structureHasChanged?: boolean;
  isSaving?: boolean;
  handleLocalizationSelection: Effect<string>;
  handleSave: Effect<void>;
  handleCachePurge: Effect<void>;
  permissions: { canUpdate?: boolean };
  locale: {
    defaultLocale: string;
    restLocale: string[];
  };
  currentLocale?: string;
}

export const NavigationHeader: React.FC<Props> = ({
  activeNavigation,
  structureHasErrors,
  structureHasChanged,
  isSaving,
  handleLocalizationSelection,
  handleSave,
  handleCachePurge,
  permissions = {},
  locale,
  currentLocale,
}) => {
  const { formatMessage } = useIntl();

  const configQuery = useConfig();

  const hasLocalizations = !!locale.restLocale?.length;
  const hasCache = !!configQuery.data?.isCacheEnabled;

  const { canUpdate } = permissions;

  const { isMobile } = usePluginMediaQuery();

  return (
    <Layouts.Header
      navigationAction={
        <Link tag={NavLink} startIcon={<ArrowLeft />} to={`/plugins/${PLUGIN_ID}`}>
          {formatMessage(getTrad('popup.navigation.manage.button.goBack'))}
        </Link>
      }
      title={activeNavigation?.name ?? formatMessage(getTrad('header.title', 'UI Navigation'))}
      subtitle={formatMessage(getTrad('header.description'))}
      primaryAction={
        <Flex direction="row" gap={2}>
          {hasLocalizations && (
            <SingleSelect
              type="select"
              placeholder={formatMessage(
                getTrad('pages.main.header.localization.select.placeholder')
              )}
              name="navigationLocalizationSelect"
              onChange={handleLocalizationSelection}
              value={currentLocale}
              size="S"
            >
              {[locale.defaultLocale, ...locale.restLocale].map((code) => (
                <SingleSelectOption key={code} value={code}>
                  {code}
                </SingleSelectOption>
              ))}
            </SingleSelect>
          )}
          {canUpdate && hasCache && (
            <Button
              onClick={handleCachePurge}
              startIcon={<Feather />}
              variant="danger-light"
              type="button"
              size="S"
            >
              {formatMessage(getTrad('submit.cta.cache.purge'))}
            </Button>
          )}
          {canUpdate && (
            <Button
              onClick={handleSave}
              startIcon={submitIcon}
              disabled={structureHasErrors || !structureHasChanged || isSaving}
              type="submit"
              size="S"
            >
              {formatMessage(getTrad('submit.cta.save'))}
            </Button>
          )}
        </Flex>
      }
      secondaryAction={
        !isMobile &&
        activeNavigation && (
          <Tag icon={<Information aria-hidden={true} />}>
            {formatMessage(getTrad('header.meta'), {
              id: activeNavigation.documentId,
              key: activeNavigation.slug,
            })}
          </Tag>
        )
      }
    />
  );
};
