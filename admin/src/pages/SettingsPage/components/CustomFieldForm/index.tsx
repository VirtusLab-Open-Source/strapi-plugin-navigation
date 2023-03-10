import React, { useCallback, useMemo } from 'react';
//@ts-ignore
import { ModalBody, ModalFooter } from '@strapi/design-system/ModalLayout';
//@ts-ignore
import { Button } from '@strapi/design-system/Button';
//@ts-ignore
import { GenericInput } from '@strapi/helper-plugin';
//@ts-ignore
import { Grid, GridItem } from '@strapi/design-system/Grid';
import { useFormik } from 'formik';
import { Effect, NavigationItemCustomField, VoidEffect } from '../../../../../../types';
import * as formDefinition from '../../utils/form';
import { getMessage } from '../../../../utils';
import { isEmpty, isNil } from 'lodash';
import { getTrad } from '../../../../translations';
import TextArrayInput from '../../../../components/TextArrayInput';
const tradPrefix = 'pages.settings.form.customFields.popup.'

interface ICustomFieldFormProps {
  customField: Partial<NavigationItemCustomField>;
  isEditForm: boolean;
  onSubmit: Effect<NavigationItemCustomField>;
  onClose: VoidEffect;
  usedCustomFieldNames: string[];
}

const customFieldsTypes = ["string", "boolean", "select"];
const prepareSelectOptions = (options: string[]) => options.map((option, index) => ({
  key: index,
  metadatas: {
    intlLabel: {
      id: option,
      defaultMessage: option,
    }
  },
  value: option,
  label: option,
}));

const CustomFieldForm: React.FC<ICustomFieldFormProps> = ({ isEditForm, customField, onSubmit, onClose, usedCustomFieldNames }) => {
  const typeSelectOptions = prepareSelectOptions(customFieldsTypes);
  const initialValues = useMemo<NavigationItemCustomField>(() => {
    if (isNil(customField.type)) {
      return formDefinition.defaultValues;
    } else if (customField.type === 'select') {
      return {
        type: customField.type,
        name: customField.name || formDefinition.defaultValues.name,
        label: customField.label || formDefinition.defaultValues.label,
        required: customField.required || formDefinition.defaultValues.required,
        options: customField.options || formDefinition.defaultValues.options,
        multi: customField.multi || formDefinition.defaultValues.multi,
        enabled: customField.enabled,
      }
    } else {
      return {
        type: customField.type,
        name: customField.name || formDefinition.defaultValues.name,
        label: customField.label || formDefinition.defaultValues.label,
        required: customField.required || formDefinition.defaultValues.required,
        options: [],
        multi: false,
        enabled: customField.enabled,
      }
    }
  }, [customField]);

  const {
    handleChange,
    setFieldValue,
    values,
    errors,
    handleSubmit,
    isSubmitting,
  } = useFormik<NavigationItemCustomField>({
    initialValues,
    onSubmit,
    validationSchema: formDefinition.schemaFactory(usedCustomFieldNames),
    validateOnChange: false,
  });
  const defaultProps = useCallback((fieldName: keyof NavigationItemCustomField) => ({
    intlLabel: getTrad(`${tradPrefix}${fieldName}.label`),
    onChange: handleChange,
    name: fieldName,
    value: values[fieldName],
    error: errors[fieldName],
  }), [values, errors, handleChange]);

  return (
    <form>
      <ModalBody>
        <Grid gap={5}>
          <GridItem key="name" col={12}>
            <GenericInput
              {...defaultProps("name")}
              autoFocused
              placeholder={getTrad(`${tradPrefix}name.placeholder`)}
              description={getTrad(`${tradPrefix}name.description`)}
              type="text"
              disabled={isEditForm}
            />
          </GridItem>
          <GridItem key="label" col={12}>
            <GenericInput
              {...defaultProps("label")}
              placeholder={getTrad(`${tradPrefix}label.placeholder`)}
              description={getTrad(`${tradPrefix}label.description`)}
              type="text"
            />
          </GridItem>
          <GridItem key="type" col={12}>
            <GenericInput
              {...defaultProps("type")}
              options={typeSelectOptions}
              type="select"
              disabled={isEditForm}
            />
          </GridItem>
          {values.type === 'select' && (
            <>
              <GridItem key="multi" col={12}>
                <GenericInput
                  {...defaultProps("multi")}
                  type="bool"
                />
              </GridItem>
              <GridItem key="options" col={12}>
                <TextArrayInput
                  {...defaultProps("options")}
                  onChange={v => setFieldValue("options", v)}
                  label={getMessage(`${tradPrefix}options.label`)}
                  initialValue={values.options}
                />
              </GridItem>
            </>
          )}
          <GridItem key="required" col={12}>
            <GenericInput
              {...defaultProps("required")}
              type="bool"
              description={getTrad(`${tradPrefix}required.description`)}
            />
          </GridItem>
        </Grid>
      </ModalBody>
      <ModalFooter
        startActions={
          <Button onClick={onClose} variant="tertiary">
            {getMessage('popup.item.form.button.cancel')}
          </Button>
        }
        endActions={
          <Button onClick={handleSubmit} disabled={!isEmpty(errors) || isSubmitting}>
            {getMessage(`popup.item.form.button.save`)}
          </Button>
        }
      />
    </form>
  );
}

export default CustomFieldForm;
