import { AnyEntity } from '@sensinum/strapi-utils';
import { Form, useNotification } from '@strapi/strapi/admin';
import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { Grid, Modal } from '@strapi/design-system';

import { NavigationSchema } from '../../../../api/validators';
import { NavigationItemAdditionalField } from '../../../../schemas';
import { getTrad } from '../../../../translations';
import { Effect, FormItemErrorSchema, VoidEffect } from '../../../../types';
import { useConfig, useContentTypeItems } from '../../hooks';
import { extractRelatedItemLabel } from '../../utils';
import { NavigationItemPopupFooter } from '../NavigationItemPopup/NavigationItemPopupFooter';
import { ContentTypeEntity } from './types';
import {
  fallbackDefaultValues,
  navigationItemFormSchema,
  NavigationItemFormSchema,
} from './utils/form';
import { useFormValues, usePayload, useSlug } from './utils/hooks';
import { generateUiRouterKey } from './utils/properties';
import { NavigationItemFormContext } from './context/NavigationItemFormContext';
import { NavigationItemTypeField } from './components/NavigationItemTypeField';
import { AttachToMenuField } from './components/AttachToMenuField';
import { TitleField } from './components/TitleField';
import { ReadFieldsFromRelatedField } from './components/ReadFieldsFromRelatedField';
import { PathField } from './components/PathField';
import { AdditionalFields } from './components/AdditionalFields';
import { CopyFromLocales } from './components/CopyFromLocales';
import { RelatedTypeField } from './components/RelatedTypeField';
import { RelatedEntityField } from './components/RelatedEntityField';

export { ContentTypeEntity, GetContentTypeEntitiesPayload } from './types';
export { NavigationItemFormSchema } from './utils/form';

export type SubmitEffect = Effect<NavigationItemFormSchema>;

type NavigationItemFormProps = {
  appendLabelPublicationStatus: (label: string, entity: ContentTypeEntity, _: boolean) => string;
  current: Partial<NavigationItemFormSchema>;
  isLoading: boolean;
  locale: string;
  onCancel: VoidEffect;
  onSubmit: SubmitEffect;
  availableLocale: string[];
  permissions?: Partial<{ canUpdate: boolean }>;
  currentNavigation: Pick<NavigationSchema, 'id' | 'documentId' | 'locale'>;
};

const FALLBACK_ADDITIONAL_FIELDS: Array<NavigationItemAdditionalField> = [];

export const NavigationItemForm: React.FC<NavigationItemFormProps> = ({
  availableLocale,
  isLoading: isPreloading,
  current = fallbackDefaultValues,
  onSubmit,
  onCancel,
  appendLabelPublicationStatus = appendLabelPublicationStatusFallback,
  locale,
  permissions = {},
  currentNavigation,
}) => {
  const { formatMessage } = useIntl();

  const [isLoading, setIsLoading] = useState(isPreloading);

  const { canUpdate } = permissions;

  const [isSingleSelected, setIsSingleSelected] = useState(false);

  const configQuery = useConfig();

  const contentTypes = configQuery.data?.contentTypes ?? [];

  const { toggleNotification } = useNotification();

  const {
    formValue,
    renderError,
    setFormError,
    handleChange,
    setFormValue,
    setFormValueItem,
    setFormValuesItems,
  } = useFormValues();

  const { encodePayload, decodePayload } = usePayload();

  const isExternal = formValue.type === 'EXTERNAL';
  const isInternal = formValue.type === 'INTERNAL';

  const submitDisabled = (isInternal && !formValue.related && !isSingleSelected) || isLoading;

  const contentTypeItemsQuery = useContentTypeItems({
    uid: isInternal ? formValue.relatedType : '',
    locale,
  });

  const submit = async (e: React.MouseEvent, values: NavigationItemFormSchema) => {
    e.preventDefault();

    const sanitizedValues = encodePayload(values);
    const {
      success,
      data: payload,
      error,
    } = navigationItemFormSchema({
      isSingleSelected,
      additionalFields: configQuery.data?.additionalFields ?? FALLBACK_ADDITIONAL_FIELDS,
    }).safeParse(sanitizedValues);

    if (success) {
      const title = !!payload.title.trim()
        ? payload.title.trim()
        : payload.type === 'INTERNAL'
          ? getDefaultTitle(payload?.related?.toString(), payload.relatedType, isSingleSelected)
          : '';

      setIsLoading(true);

      const uiRouterKey = await generateUiRouterKey(
        payload.type === 'INTERNAL'
          ? {
              slugify: slugifyMutation.mutateAsync,
              title,
              related: payload.related,
              relatedType: payload.relatedType,
            }
          : { slugify: slugifyMutation.mutateAsync, title }
      );

      slugifyMutation.reset();

      setIsLoading(false);

      if (!uiRouterKey) {
        toggleNotification({
          type: 'warning',
          message: formatMessage(getTrad('popup.item.form.uiRouter.unableToRender')),
        });
        return;
      }

      onSubmit(
        payload.type === 'INTERNAL'
          ? {
              ...payload,
              title,
              uiRouterKey,
            }
          : {
              ...payload,
              title,
              uiRouterKey,
            }
      );
    } else if (error) {
      setFormError(
        error.issues.reduce((acc, err) => {
          return {
            ...acc,
            [err.path.join('.')]: err.message,
          };
        }, {} as FormItemErrorSchema<NavigationItemFormSchema>)
      );
    }
  };

  const slugifyMutation = useSlug();

  const getDefaultTitle = useCallback(
    (related: string | undefined, relatedType: string | undefined, isSingleSelected: boolean) => {
      let selectedEntity;

      if (isSingleSelected) {
        selectedEntity = contentTypeItemsQuery.data?.find(
          (_) => _.uid === relatedType || _.__collectionUid === relatedType
        );

        if (!selectedEntity) {
          return contentTypes.find((_) => _.uid === relatedType)?.contentTypeName;
        }
      } else {
        const entity = contentTypeItemsQuery.data?.find(({ documentId }) => documentId === related);

        selectedEntity = {
          ...(entity || {
            documentId: null,
          }),
          __collectionUid: relatedType,
        };
      }
      return extractRelatedItemLabel(selectedEntity as AnyEntity, configQuery.data);
    },
    [contentTypeItemsQuery.data, configQuery.data, contentTypes]
  );

  useEffect(() => {
    setFormValue(
      decodePayload({
        ...fallbackDefaultValues,
        ...current,
      } as NavigationItemFormSchema)
    );
  }, [current]);

  return (
    <>
      <Modal.Body>
        <Form width="auto" height="auto" method="POST" initialValues={formValue}>
          {({ values, onChange }) => {
            return (
              <NavigationItemFormContext.Provider
                value={{
                  values,
                  onChange,
                  handleChange,
                  renderError,
                  setFormValueItem,
                  canUpdate,
                  isLoading,
                }}
              >
                <Grid.Root gap={5} paddingBottom={1}>
                  <NavigationItemTypeField />
                  <AttachToMenuField current={current} />
                </Grid.Root>

                <Grid.Root gap={5} paddingTop={1} paddingBottom={1}>
                  <TitleField />
                  {values.type === 'INTERNAL' && <ReadFieldsFromRelatedField />}
                </Grid.Root>

                <Grid.Root gap={5} paddingTop={1} paddingBottom={1}>
                  <PathField
                    contentTypeItems={contentTypeItemsQuery.data}
                    current={current}
                    isExternal={isExternal}
                    isSingleSelected={isSingleSelected}
                  />
                </Grid.Root>

                {values.type === 'INTERNAL' && (
                  <Grid.Root gap={5} paddingTop={1} paddingBottom={1}>
                    <RelatedTypeField
                      contentTypeItems={contentTypeItemsQuery.data}
                      current={current}
                      currentRelatedType={values.relatedType}
                      isSingleSelected={isSingleSelected}
                      setFormValuesItems={setFormValuesItems}
                      setIsSingleSelected={setIsSingleSelected}
                    />
                    <RelatedEntityField
                      appendLabelPublicationStatus={appendLabelPublicationStatus}
                      contentTypeItems={contentTypeItemsQuery.data}
                      values={values}
                      isSingleSelected={isSingleSelected}
                      setFormValuesItems={setFormValuesItems}
                    />
                  </Grid.Root>
                )}

                <AdditionalFields />

                <CopyFromLocales
                  availableLocale={availableLocale}
                  current={current}
                  currentNavigation={currentNavigation}
                  setIsLoading={setIsLoading}
                />

                <Grid.Root gap={5}>
                  <Grid.Item alignItems="flex-start" key="title" col={12}></Grid.Item>
                </Grid.Root>
              </NavigationItemFormContext.Provider>
            );
          }}
        </Form>
      </Modal.Body>

      <NavigationItemPopupFooter
        handleSubmit={(e: React.MouseEvent) => submit(e, formValue)}
        handleCancel={onCancel}
        submitDisabled={submitDisabled}
        canUpdate={canUpdate}
      />
    </>
  );
};

const appendLabelPublicationStatusFallback = () => '';
