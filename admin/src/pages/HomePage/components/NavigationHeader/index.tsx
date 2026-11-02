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

  @media (min-width: 520px) {
    order: ${({ orderSmall }) => orderSmall ?? 'unset'};
  }

  @media (min-width: 768px) {
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

  const configQuery = useConfig();

  const hasLocalizations = !!locale.restLocale?.length;
  const hasCache = configQuery.data?.isCacheEnabled;

  const { canUpdate } = permissions;

  const { isDesktop, isMobile, isLargeDesktop } = usePluginMediaQuery();

  return (
    <>
      <Layouts.Header
        title={formatMessage(getTrad('header.title', 'UI Navigation'))}
        subtitle={isLargeDesktop && formatMessage(getTrad('header.description'))}
        primaryAction={
          <Flex
            direction="row"
            size={2}
            width={isLargeDesktop ? 'auto' : !isMobile ? '728px' : '100%'}
          >
            <Box width="100%">
              <Grid.Root
                gap={{ initial: 2, medium: 4 }}
                width="100%"
                style={configQuery.data?.isCacheEnabled ? { display: 'flex' } : undefined}
              >
                {!hasLocalizations && isLargeDesktop ? <Grid.Item m={2} xs={0} /> : null}
                {canUpdate && (
                  <StyledGridItem
                    m={3}
                    xs={hasCache ? 4 : 6}
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
                  xs={hasLocalizations ? 9 : 12}
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
                  <StyledGridItem m={2} xs={3} orderInitial={2} orderSmall={2} orderMedium={3}>
                    <Field.Root width="100%">
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
                    </Field.Root>
                  </StyledGridItem>
                ) : null}
                {canUpdate && (
                  <StyledGridItem
                    m={3}
                    xs={hasCache ? 4 : 6}
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
                {hasCache && (
                  <>
                    {isDesktop && (
                      <StyledGridItem m={9} orderInitial={5} orderSmall={5} orderMedium={5} />
                    )}
                    <StyledGridItem m={3} xs={4} orderInitial={6} orderSmall={6} orderMedium={6}>
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
                  </>
                )}
              </Grid.Root>
            </Box>
            {canUpdate && navigationManagerModal}
          </Flex>
        }
        secondaryAction={
          !isMobile && (
            <Tag icon={<Information aria-hidden={true} />}>
              {activeNavigation
                ? formatMessage(getTrad('header.meta'), {
                    id: activeNavigation?.documentId,
                    key: activeNavigation?.slug,
                  })
                : null}
            </Tag>
          )
        }
      />
    </>
  );
};
