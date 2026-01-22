import { useIntl } from 'react-intl';
import styled from 'styled-components';

import { Grid, TextInput } from '@strapi/design-system';
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

export const TitleField = () => {
  const { formatMessage } = useIntl();

  const { values, onChange, handleChange, renderError, canUpdate } = useNavigationItemFormContext();

  return (
    <StyledGridItem
      alignItems="flex-start"
      key="title"
      col={values.type === 'INTERNAL' ? 8 : 12}
      m={values.type === 'INTERNAL' ? 8 : 12}
      xs={12}
      orderInitial={2}
      orderMedium={1}
    >
      <Field
        name="title"
        label={formatMessage(getTrad('popup.item.form.title.label', 'Title'))}
        error={renderError('title')}
        hint={formatMessage(getTrad('popup.item.form.title.placeholder', 'e.g. Blog'))}
      >
        <TextInput
          type="string"
          disabled={!canUpdate || (values.autoSync && values.type === 'INTERNAL')}
          name="title"
          onChange={(eventOrPath: FormChangeEvent, value?: any) =>
            handleChange(eventOrPath, value, onChange)
          }
          value={values.title || ''}
        />
      </Field>
    </StyledGridItem>
  );
};
