import { useIntl } from 'react-intl';
import { useCallback, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Divider,
  Grid,
  SingleSelect,
  SingleSelectOption,
} from '@strapi/design-system';
import { Field } from '@sensinum/strapi-utils';

import { getTrad } from '../../../../../../translations';
import { useNavigationItemFormContext } from '../../context/NavigationItemFormContext';
import { useCopyNavigationItemI18n, useNavigations } from '../../../../hooks';
import { NavigationSchema } from '../../../../../../api/validators';
import { NavigationItemFormSchema } from '../../utils/form';

type CopyFromLocalesProps = {
  availableLocale: string[];
  current: Partial<NavigationItemFormSchema>;
  currentNavigation: Pick<NavigationSchema, 'id' | 'documentId' | 'locale'>;
  setIsLoading: (isLoading: boolean) => void;
};

export const CopyFromLocales: React.FC<CopyFromLocalesProps> = ({
  availableLocale,
  current,
  currentNavigation,
  setIsLoading,
}) => {
  const { formatMessage } = useIntl();

  const [itemLocaleCopyValue, setItemLocaleCopyValue] = useState<string>();

  const copyItemFromLocaleMutation = useCopyNavigationItemI18n();
  const navigationsQuery = useNavigations();

  const { canUpdate, isLoading, setFormValueItem } = useNavigationItemFormContext();

  const availableLocaleOptions = useMemo(
    () =>
      availableLocale.map((locale, index) => ({
        key: `${locale}-${index}`,
        value: locale,
        label: locale,
      })),
    [availableLocale]
  );

  const onCopyFromLocale = useCallback(
    async (event: React.BaseSyntheticEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const source = navigationsQuery.data?.find(({ locale }) => locale === itemLocaleCopyValue);
      console.log(current)
      if (source) {
        setIsLoading(true);

        copyItemFromLocaleMutation.mutate(
          {
            target: currentNavigation.documentId,
            structureId: current.structureId,
            source: source.documentId,
          },
          {
            onSuccess(data) {
              copyItemFromLocaleMutation.reset();

              const { type, externalPath, path, related, title, uiRouterKey } = data;
              const { __type, documentId } = related ?? {};

              setFormValueItem('type', type);
              setFormValueItem('externalPath', externalPath ?? undefined);
              setFormValueItem('path', path ?? undefined);
              setFormValueItem('title', title);
              setFormValueItem('uiRouterKey', uiRouterKey);

              if (__type && documentId) {
                setFormValueItem('related', documentId);
                setFormValueItem('relatedType', __type);
              }
            },
            onSettled() {
              setIsLoading(false);
            },
          }
        );
      }
    },
    [setIsLoading, copyItemFromLocaleMutation, navigationsQuery]
  );

  if (!availableLocaleOptions || availableLocaleOptions.length < 1) {
    return null;
  }

  return (
    <Grid.Root gap={5} paddingTop={1} paddingBottom={1}>
      <Grid.Item alignItems="flex-start" key="title" col={12}>
        <Divider marginTop={5} marginBottom={5} />

        <Grid.Root gap={5}>
          <Grid.Item alignItems="flex-start" col={6} lg={12}>
            <Field
              name="i18n.locale"
              label={formatMessage(
                getTrad('popup.item.form.i18n.locale.label', 'Copy details from')
              )}
            >
              <SingleSelect
                name="i18n.locale"
                onChange={setItemLocaleCopyValue}
                value={itemLocaleCopyValue}
                disabled={isLoading || !canUpdate}
                placeholder={formatMessage(
                  getTrad('popup.item.form.i18n.locale.placeholder', 'locale')
                )}
              >
                {availableLocaleOptions.map(({ key, label, value }) => (
                  <SingleSelectOption key={key} value={value}>
                    {label}
                  </SingleSelectOption>
                ))}
              </SingleSelect>
            </Field>
          </Grid.Item>

          {canUpdate && (
            <Grid.Item alignItems="flex-start" col={6} lg={12} paddingTop={6}>
              <Box>
                <Button
                  variant="tertiary"
                  onClick={onCopyFromLocale}
                  disabled={isLoading || !itemLocaleCopyValue}
                >
                  {formatMessage(getTrad('popup.item.form.i18n.locale.button'))}
                </Button>
              </Box>
            </Grid.Item>
          )}
        </Grid.Root>
      </Grid.Item>
    </Grid.Root>
  );
};
