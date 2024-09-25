import { Flex, Typography } from '@strapi/design-system';
import { CaretDown, CaretUp } from '@strapi/icons';
import styled from 'styled-components';

import { Effect } from '../../../../types';

const Wrapper = styled.div`
  border-radius: 50%;
  background: #dcdce4;
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
`;

interface Props {
  toggle: Effect<any>;
  collapsed?: boolean;
  itemsCount?: number;
}

export const CollapseButton = ({ toggle, collapsed, itemsCount }: Props) => (
  <Flex
    justifyContent="space-between"
    alignItems="center"
    onClick={toggle}
    cursor="pointer"
    style={{ marginRight: '16px' }}
  >
    <Wrapper>
      {collapsed ? <CaretDown width="16px" height="9px" /> : <CaretUp width="16px" height="9px" />}
    </Wrapper>
    <Typography variant="pi">{itemsCount} nested items</Typography>
  </Flex>
);
