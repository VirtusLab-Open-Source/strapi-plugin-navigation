import React from 'react';
//@ts-ignore
import { ModalBody } from '@strapi/design-system/ModalLayout';
//@ts-ignore
import { GenericInput } from '@strapi/helper-plugin';
//@ts-ignore
import { Grid, GridItem } from '@strapi/design-system/Grid';
//@ts-ignore
import { Formik, Form } from 'formik';
import { get } from 'lodash';
import { getTradId } from '../../../translations';
import { NavigationItemCustomField } from '../../../../../types';
const tradPrefix = 'pages.settings.form.customFields.popup.'

// TODO: Make sure CustomField.name is unique by supplying existing names to form.
// TODO: Introduce select and multi-select custom fields types
// TODO: Introduce options of type Array<{key, label} | string> for select and multi-select
interface CustomFieldFormProps {
  values: NavigationItemCustomField;
  isEditForm: boolean;
  setFieldValue: (name: string, value: string) => void;
}

const customFieldsTypes = ["string", "boolean"];

const CustomFieldForm: React.FC<CustomFieldFormProps> = ({ isEditForm, values, setFieldValue }) => {
  const prepareSelectOptions = <T extends string = string>(options: T[]) => options.map((option, index) => ({
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

  const getTradObject = (id: string) => ({
    id: getTradId(id),
    defaultMessage: getTradId(id),
  });
  return (
    <Formik>
      <Form>
        <ModalBody>
          <Grid gap={5}>
            <GridItem key="name" col={12}>
              <GenericInput
                autoFocused={true}
                intlLabel={getTradObject(`${tradPrefix}name.label`)}
                name="name"
                placeholder={getTradObject(`${tradPrefix}name.placeholder`)}
                description={getTradObject(`${tradPrefix}name.description`)}
                type="text"
                onChange={({ target: { name, value } }: React.BaseSyntheticEvent) => setFieldValue(name, value)}
                value={get(values, "name", "")}
                disabled={isEditForm}
              />
            </GridItem>
            <GridItem key="label" col={12}>
              <GenericInput
                autoFocused={true}
                intlLabel={getTradObject(`${tradPrefix}label.label`)}
                name="label"
                placeholder={getTradObject(`${tradPrefix}label.placeholder`)}
                description={getTradObject(`${tradPrefix}label.description`)}
                type="text"
                onChange={({ target: { name, value } }: React.BaseSyntheticEvent) => setFieldValue(name, value)}
                value={get(values, "label", "")}
              />
            </GridItem>
            <GridItem key="type" col={12}>
              <GenericInput
                intlLabel={getTradObject(`${tradPrefix}type.label`)}
                name="type"
                options={prepareSelectOptions(customFieldsTypes)}
                type="select"
                onChange={({ target: { name, value } }: React.BaseSyntheticEvent) => setFieldValue(name, value)}
                value={get(values, "type", "")}
              />
            </GridItem>
          </Grid>
        </ModalBody>
      </Form>
    </Formik>
  );
}

export default CustomFieldForm;
