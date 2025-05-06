import { CardTitle } from '@strapi/design-system';
import styled, { DefaultTheme } from 'styled-components';

export const CardItemTitle = styled(CardTitle)`
  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  > div > * {
    margin: 0px ${({ theme }: { theme: DefaultTheme }) => theme?.spaces[1]};
  }
`;
