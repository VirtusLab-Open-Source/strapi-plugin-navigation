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
import styled from 'styled-components';
import { NavigationSchema } from '../../../../api/validators';
import { getTrad } from '../../../../translations';
import { Effect } from '../../../../types';
import { useConfig, usePluginMediaQuery } from '../../hooks';
import { useNavigationManager } from './hooks';

const StyledGridItem = styled(Grid.Item)<{ 
  orderInitial?: number; 
  orderSmall?: number; 
  orderMedium?: number;
}>`
  order: ${({ orderInitial }) => orderInitial ?? 'unset'};

  @media (min-width: 768px) {
    order: ${({ orderSmall }) => orderSmall ?? 'unset'};
  }

  @media (min-width: 1024px) {
    order: ${({ orderMedium }) => orderMedium ?? 'unset'};
  }
`;

const submitIcon = <Check />;

interface Props {
  activeNavigation?: NavigationSchema;
  availableNavigations: NavigationSchema[];
  structureHasErrors?: boolean;
  structureHasChanged?: boolean;
  isSaving?: boolean;
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
  isSaving,
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

  const { isDesktop } = usePluginMediaQuery();

  return (
    <>
      <Layouts.Header
        title={formatMessage(getTrad('header.title', 'UI Navigation'))}
        subtitle={isDesktop && formatMessage(getTrad('header.description'))}
        primaryAction={
          <Flex direction="row" size={2} width={{ initial: '100%', medium: 'auto' }}>
            <Box width="100%">
              <Grid.Root
                gap={4}
                width="100%"
                style={configQuery.data?.isCacheEnabled ? { display: 'flex' } : undefined}
              >
                {!hasLocalizations ? <Grid.Item col={2} /> : null}
                {canUpdate && (
                  <StyledGridItem 
                    m={3} 
                    s={6} 
                    xs={6}
                    orderInitial={3}
                    orderSmall={3}
                    orderMedium={1}
                  >
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
                  </StyledGridItem>
                )}
                <StyledGridItem 
                  m={canUpdate ? 4 : 10} 
                  s={10}
                  orderInitial={1}
                  orderSmall={1}
                  orderMedium={2}
                >
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
                </StyledGridItem>
                {hasLocalizations ? (
                  <StyledGridItem 
                    m={2} 
                    s={6} 
                    xs={6}
                    orderInitial={2}
                    orderSmall={2}
                    orderMedium={3}
                  >
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
                  </StyledGridItem>
                ) : null}
                {canUpdate && (
                  <StyledGridItem 
                    m={3} 
                    s={6} 
                    xs={6}
                    orderInitial={4}
                    orderSmall={4}
                    orderMedium={4}
                  >
                    <Button
                      onClick={handleSave}
                      startIcon={submitIcon}
                      disabled={structureHasErrors || !structureHasChanged || isSaving}
                      type="submit"
                      fullWidth
                      size="S"
                    >
                      {formatMessage(getTrad('submit.cta.save'))}
                    </Button>
                  </StyledGridItem>
                )}
                {configQuery.data?.isCacheEnabled && (
                  <StyledGridItem 
                    m={3} 
                    s={12} 
                    xs={12}
                    orderInitial={5}
                    orderSmall={5}
                    orderMedium={5}
                  >
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
                  </StyledGridItem>
                )}
              </Grid.Root>
            </Box>
            {canUpdate && navigationManagerModal}
          </Flex>
        }
        secondaryAction={
          <Tag icon={<Information aria-hidden={true} />} fontSize="10px">
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
