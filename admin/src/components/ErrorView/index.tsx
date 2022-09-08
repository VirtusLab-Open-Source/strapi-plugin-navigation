import React from 'react';
// @ts-ignore
import { Typography } from '@strapi/design-system/Typography';
// @ts-ignore
import styled from 'styled-components'
// @ts-ignore
import { Flex } from '@strapi/design-system/Flex';

const Wrapper = styled(Flex)`
  height: 100vh;
`;

interface IProps {
  error: Error | null;
}

//TODO: [@ltsNotMike] Add translations to this view
const ErrorView: React.FC<IProps> = () => (
  <Wrapper justifyContent="space-around">
    <Typography variant="beta">Error occured while rendering view.</Typography>
  </Wrapper>
);


export default ErrorView;