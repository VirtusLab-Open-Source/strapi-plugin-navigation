import { useIntl } from 'react-intl';
import styled from 'styled-components';

import { Grid, Toggle } from '@strapi/design-system';
import { Field } from '@sensinum/strapi-utils';

import { getTrad } from '../../../../../../translations';
import { FormChangeEvent } from '../../../../../../types';
import { useNavigationItemFormContext } from '../../context/NavigationItemFormContext';

const StyledGridItem = styled(Grid.Item)<{
  orderInitial?: number;
  orderSmall?: number;
  orderMedium?: number;
}>`
  order: ${({ orderInitial }) => orderInitial ?? 'unset'};

  @media (min-width: 768px) {
    order: ${({ orderMedium }) => orderMedium ?? 'unset'};
  }
`;

export const ReadFieldsFromRelatedField = () => {
  const { formatMessage } = useIntl();

  const { values, onChange, handleChange, renderError, canUpdate } = useNavigationItemFormContext();

  return (
    <StyledGridItem
      alignItems="flex-start"
      key="autoSync"
      col={4}
      m={4}
      xs={12}
      orderInitial={1}
      orderMedium={2}
    >
      <Field
        name="autoSync"
        label={formatMessage(getTrad('popup.item.form.autoSync.label', 'Read fields from related'))}
        error={renderError('autoSync')}
      >
        <Toggle
          name="autoSync"
          checked={values.autoSync}
          onChange={(eventOrPath: FormChangeEvent) =>
            handleChange(eventOrPath, !values.autoSync, onChange)
          }
          disabled={!canUpdate}
          onLabel="Enabled"
          offLabel="Disabled"
        />
      </Field>
    </StyledGridItem>
  );
};
