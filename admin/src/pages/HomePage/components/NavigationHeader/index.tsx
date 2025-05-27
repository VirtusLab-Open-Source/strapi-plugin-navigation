import {
  Box,
  Button,
  Field,
  Flex,
  Grid,
  SingleSelect,
  SingleSelectOption,
  Tag,
} from '@strapi/design-system';
import { Check, Information } from '@strapi/icons';
import { Layouts } from '@strapi/strapi/admin';
import React from 'react';
import { useIntl } from 'react-intl';
import { NavigationSchema } from '../../../../api/validators';
import { getTrad } from '../../../../translations';
import { Effect } from '../../../../types';
import { useConfig } from '../../hooks';
import { useNavigationManager } from './hooks';

const submitIcon = <Check />;

interface Props {
  activeNavigation?: NavigationSchema;
  availableNavigations: NavigationSchema[];
  structureHasErrors?: boolean;
  structureHasChanged?: boolean;
  handleChangeSelection: Effect<NavigationSchema>;
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
  availableNavigations,
  structureHasErrors,
  structureHasChanged,
  handleChangeSelection,
  handleLocalizationSelection,
  handleSave,
  handleCachePurge,
  permissions = {},
  locale,
  currentLocale,
}) => {
  const { formatMessage } = useIntl();
  const { openNavigationManagerModal, navigationManagerModal } = useNavigationManager();

  const hasLocalizations = !!locale.restLocale;

  const { canUpdate } = permissions;

  const configQuery = useConfig();

  return (
    <>
      <Layouts.Header
        title={formatMessage(getTrad('header.title', 'UI Navigation'))}
        subtitle={formatMessage(getTrad('header.description'))}
        primaryAction={
          <Flex direction="row" size={2}>
            <Box>
              <Grid.Root
                gap={4}
                style={configQuery.data?.isCacheEnabled ? { display: 'flex' } : undefined}
              >
                {!hasLocalizations ? <Grid.Item col={2} /> : null}
                {canUpdate && (
                  <Grid.Item col={3}>
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
                  </Grid.Item>
                )}
                <Grid.Item col={canUpdate ? 4 : 10}>
                  <Field.Root width="100%">
                    <SingleSelect
                      type="select"
                      placeholder="Change navigation"
                      name="navigationSelect"
                      onChange={(nextDocumentId: string) => {
                        const nextNavigation = availableNavigations.find(
                          ({ documentId }) => nextDocumentId === documentId
                        );

                        if (nextNavigation) {
                          handleChangeSelection(nextNavigation);
                        }
                      }}
                      value={activeNavigation?.documentId}
                      size="S"
                      style={null}
                    >
                      {availableNavigations
                        .filter(({ locale }) => locale === currentLocale)
                        .map(({ documentId, name }) => (
                          <SingleSelectOption key={documentId} value={documentId}>
                            {name}
                          </SingleSelectOption>
                        ))}
                    </SingleSelect>
                  </Field.Root>
                </Grid.Item>
                {hasLocalizations ? (
                  <Grid.Item col={2}>
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
                  </Grid.Item>
                ) : null}
                {canUpdate && (
                  <Grid.Item col={3}>
                    <Button
                      onClick={handleSave}
                      startIcon={submitIcon}
                      disabled={structureHasErrors || !structureHasChanged}
                      type="submit"
                      fullWidth
                      size="S"
                    >
                      {formatMessage(getTrad('submit.cta.save'))}
                    </Button>
                  </Grid.Item>
                )}
                {configQuery.data?.isCacheEnabled && (
                  <Grid.Item col={3}>
                    <Button
                      onClick={handleCachePurge}
                      startIcon={submitIcon}
                      variant="danger"
                      type="submit"
                      fullWidth
                      size="S"
                    >
                      {formatMessage(getTrad('submit.cta.cache.purge'))}
                    </Button>
                  </Grid.Item>
                )}
              </Grid.Root>
            </Box>
            {canUpdate && navigationManagerModal}
          </Flex>
        }
        secondaryAction={
          <Tag icon={<Information aria-hidden={true} />}>
            {activeNavigation
              ? formatMessage(getTrad('header.meta'), {
                  id: activeNavigation?.documentId,
                  key: activeNavigation?.slug,
                })
              : null}
          </Tag>
        }
      />
    </>
  );
};
