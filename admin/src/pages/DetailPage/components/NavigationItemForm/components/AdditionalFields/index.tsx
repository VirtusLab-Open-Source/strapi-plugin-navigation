import { isEmpty } from 'lodash';

import { Grid, Divider } from '@strapi/design-system';

import { CustomFieldsField } from './CustomFieldsField';
import { AudienceField } from './AudienceField';
import { useConfig } from '../../../../hooks';
import { NavigationItemCustomField } from '../../../../../../schemas';

export const AdditionalFields = () => {
  const configQuery = useConfig();

  if (!configQuery.data?.additionalFields || isEmpty(configQuery.data.additionalFields)) {
    return null;
  }

  const customFields = configQuery.data.additionalFields.filter(
    (field) => field !== 'audience'
  ) as NavigationItemCustomField[];

  const audienceField = configQuery.data.additionalFields.find((field) => field === 'audience');

  return (
    <>
      <Grid.Root gap={5} paddingTop={1} paddingBottom={1}>
        <Grid.Item col={12}>
          <Divider width="100%" />
        </Grid.Item>
      </Grid.Root>

      <Grid.Root gap={5} paddingTop={1} paddingBottom={1}>
        {customFields.map((customField) => (
          <CustomFieldsField key={customField.name} additionalField={customField} />
        ))}
        {audienceField && <AudienceField />}
      </Grid.Root>

      <Grid.Root gap={5} paddingTop={1} paddingBottom={1}>
        <Grid.Item col={12}>
          <Divider width="100%" />
        </Grid.Item>
      </Grid.Root>
    </>
  );
};
