import { Flex } from '@strapi/design-system';
import { ReactNode } from 'react';

interface Props {
  startActions: ReactNode;
  endActions: ReactNode;
}

export const NavigationContentHeader = ({ startActions, endActions }: Props) => {
  return (
    <Flex 
      direction={{ initial: 'column-reverse', small: 'row' }}
      justifyContent={{ initial: "flex-start", small: "space-between" }}
      width="100%"
      gap={{ initial: 2, small: 0 }}
    >
      <Flex alignItems="space-between" width="100%">{startActions}</Flex>
      <Flex
        gap={{ initial: 2, small: 0 }}
        alignItems="space-between"
        width="100%"
        justifyContent={{ initial: "flex-start", small: "flex-end" }}
      >
        {endActions}
      </Flex>
    </Flex>
  );
};
