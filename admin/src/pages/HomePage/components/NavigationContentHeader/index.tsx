import { Flex } from '@strapi/design-system';
import { ReactNode } from 'react';

interface Props {
  startActions: ReactNode;
  endActions: ReactNode;
}

export const NavigationContentHeader = ({ startActions, endActions }: Props) => {
  return (
    <Flex justifyContent="space-between" width="100%">
      <Flex alignItems="space-between">{startActions}</Flex>
      <Flex alignItems="space-between">{endActions}</Flex>
    </Flex>
  );
};
