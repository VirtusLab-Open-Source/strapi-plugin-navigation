import React from 'react';
//@ts-ignore
import { Flex } from '@strapi/design-system/Flex';
//@ts-ignore
import { Typography } from '@strapi/design-system/Typography';
//@ts-ignore
import { IconButton } from '@strapi/design-system/IconButton';
//@ts-ignore
import { Icon } from '@strapi/design-system/Icon';
//@ts-ignore
import DragButton from '../../DragButton';
import Wrapper from './Wrapper';
import ItemCardBadge from '../ItemCardBadge';
import { getMessage } from '../../../utils';
import { ToBeFixed, VoidEffect } from '../../../../../types';
import { pencilIcon, refreshIcon, trashIcon } from '../../../components/icons';

interface IProps {
  title: string,
  path: string,
  icon: ToBeFixed,
  removed: boolean,
  onItemRemove: VoidEffect,
  onItemEdit: VoidEffect,
  onItemRestore: VoidEffect,
  dragRef: React.MutableRefObject<HTMLHeadingElement>,
}

const wrapperStyle = { zIndex: 2 };
const pathWrapperStyle = { maxWidth: "425px" };

const ItemCardHeader: React.FC<IProps> = ({ title, path, icon, removed, onItemRemove, onItemEdit, onItemRestore, dragRef }) => (
  <Wrapper>
    <Flex alignItems="center" >
      <DragButton ref={dragRef} />
      <Typography variant="omega" fontWeight="bold">
        {title}
      </Typography>
      <Typography variant="omega" fontWeight="bold" textColor='neutral500' ellipsis style={pathWrapperStyle}>
        {path}
      </Typography>
      <Flex>
        <Icon as={icon} />
      </Flex>
    </Flex>
    <Flex alignItems="center" style={wrapperStyle}>
      {removed &&
        (<ItemCardBadge
          borderColor="danger200"
          backgroundColor="danger100"
          textColor="danger600"
        >
          {getMessage("components.navigationItem.badge.removed")}
        </ItemCardBadge>)
      }

      <IconButton disabled={removed} onClick={onItemEdit} label="Edit" icon={pencilIcon} />
      {removed ?
        <IconButton onClick={onItemRestore} label="Restore" icon={refreshIcon} /> :
        <IconButton onClick={onItemRemove} label="Remove" icon={trashIcon} />
      }
    </Flex>
  </Wrapper>
);

export default ItemCardHeader;