import React from 'react';
// @ts-ignore
import { Typography } from '@strapi/design-system/Typography';
// @ts-ignore
import styled from 'styled-components'
// @ts-ignore
import { Flex } from '@strapi/design-system/Flex';
import { getMessage } from '../../utils';

const Wrapper = styled(Flex)`
  height: 100vh;
`;

interface IProps {
  error: Error | string | null;
}

const ErrorView: React.FC<IProps> = (error) => (
  <Wrapper justifyContent="space-around">
    <Typography variant="beta">{error || getMessage('notification.error')}</Typography>
  </Wrapper>
);


export default ErrorView;