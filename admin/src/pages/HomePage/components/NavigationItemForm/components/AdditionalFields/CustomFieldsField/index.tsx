import { Grid } from '@strapi/design-system';
import { Field } from '@sensinum/strapi-utils';
import { useNavigationItemFormContext } from '../../../context/NavigationItemFormContext';
import { get } from 'lodash';
import { AdditionalFieldInput } from '../AdditionalFieldInput';
import { NavigationItemCustomField } from '../../../../../../../schemas';

type CustomFieldsFieldProps = {
  additionalField: NavigationItemCustomField;
};

export const CustomFieldsField: React.FC<CustomFieldsFieldProps> = ({ additionalField }) => {
  const { canUpdate, isLoading, onChange, handleChange, renderError, values } =
    useNavigationItemFormContext();

  return (
    <Grid.Item alignItems="flex-start" key={additionalField.name} s={6} xs={12} >
      <Field
        name={`additionalFields.${additionalField.name}`}
        label={additionalField.label}
        hint={additionalField.description}
        required={additionalField.required}
        error={renderError(`additionalFields.${additionalField.name}`)}
      >
        <AdditionalFieldInput
          name={`additionalFields.${additionalField.name}`}
          field={additionalField}
          isLoading={isLoading}
          onChange={onChange}
          onChangeEnhancer={handleChange}
          value={get(values?.additionalFields, additionalField.name)}
          disabled={!canUpdate}
        />
      </Field>
    </Grid.Item>
  );
};
