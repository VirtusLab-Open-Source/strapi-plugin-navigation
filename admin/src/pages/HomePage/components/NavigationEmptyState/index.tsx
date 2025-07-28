import { useCallback } from 'react';
import { useIntl } from 'react-intl';

import {
  Box,
  Button,
  Flex,
  SingleSelect,
  SingleSelectOption,
  Typography,
} from '@strapi/design-system';
import { ListPlus } from '@strapi/icons';

import { getTrad } from '../../../../translations';
import {
  useCopyNavigationI18n,
  useI18nCopyNavigationItemsModal,
  useResetContentTypes,
  useResetNavigations,
} from '../../hooks';
import { NavigationSchema } from '../../../../api/validators';
import { appendViewId } from '../../utils/appendViewId';

type NavigationEmptyStateProps = {
  canUpdate: boolean;
  addNewNavigationItem: any;
  availableLocale: string[];
  availableNavigations: NavigationSchema[];
  currentNavigation: NavigationSchema | undefined;
  setCurrentNavigation: (navigation: NavigationSchema) => void;
};

export const NavigationEmptyState: React.FC<NavigationEmptyStateProps> = ({
  canUpdate,
  addNewNavigationItem,
  availableLocale,
  availableNavigations,
  currentNavigation,
  setCurrentNavigation,
}) => {
  const copyNavigationI18nMutation = useCopyNavigationI18n();

  const { formatMessage } = useIntl();

  const resetContentTypes = useResetContentTypes();
  const resetNavigations = useResetNavigations();

  const {
    i18nCopyItemsModal,
    i18nCopySourceLocale,
    setI18nCopyModalOpened,
    setI18nCopySourceLocale,
  } = useI18nCopyNavigationItemsModal(
    useCallback(
      (sourceLocale) => {
        const source = availableNavigations.find(
          ({ locale, documentId }) =>
            locale === sourceLocale && documentId === currentNavigation?.documentId
        );

        if (source) {
          if (source.documentId && currentNavigation?.documentId) {
            copyNavigationI18nMutation.mutate(
              {
                source: source.locale,
                target: currentNavigation.locale,
                documentId: source.documentId,
              },
              {
                onSuccess(res) {
                  copyNavigationI18nMutation.reset();
                  setCurrentNavigation({
                    ...res.data,
                    items: res.data.items.map(appendViewId),
                  });
                  resetContentTypes();
                  resetNavigations();
                },
              }
            );
          }
        }
      },
      [currentNavigation]
    )
  );

  const openI18nCopyModalOpened = useCallback(() => {
    i18nCopySourceLocale && setI18nCopyModalOpened(true);
  }, [setI18nCopyModalOpened, i18nCopySourceLocale]);

  return (
    <Flex direction="column" minHeight="400px" justifyContent="center">
      <Box padding={4}>
        <Typography variant="beta" textColor="neutral600">
          {formatMessage(getTrad('empty.description'))}
        </Typography>
      </Box>
      {canUpdate && (
        <Button
          variant="secondary"
          startIcon={<ListPlus />}
          label={formatMessage(getTrad('empty.cta'))}
          onClick={addNewNavigationItem}
        >
          {formatMessage(getTrad('empty.cta'))}
        </Button>
      )}
      {canUpdate && availableLocale.length && (
        <Flex direction="column" justifyContent="center">
          <Box paddingTop={3} paddingBottom={3}>
            <Typography variant="beta" textColor="neutral600">
              {formatMessage(getTrad('view.i18n.fill.cta.header'))}
            </Typography>
          </Box>
          <Flex direction="row" justifyContent="center" alignItems="center">
            <Box paddingLeft={1} paddingRight={1}>
              <SingleSelect
                onChange={setI18nCopySourceLocale}
                value={i18nCopySourceLocale}
                size="S"
              >
                {availableLocale.map((locale) => (
                  <SingleSelectOption key={locale} value={locale}>
                    {formatMessage(getTrad('view.i18n.fill.option'), { locale })}
                  </SingleSelectOption>
                ))}
              </SingleSelect>
            </Box>
            <Box paddingLeft={1} paddingRight={1}>
              <Button
                variant="tertiary"
                onClick={openI18nCopyModalOpened}
                disabled={!i18nCopySourceLocale}
                size="S"
              >
                {formatMessage(getTrad('view.i18n.fill.cta.button'))}
              </Button>
            </Box>
          </Flex>
        </Flex>
      )}
      {canUpdate && i18nCopyItemsModal}
    </Flex>
  );
};
