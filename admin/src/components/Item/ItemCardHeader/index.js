import React from 'react';
import styled from 'styled-components';

import { Flex } from '@strapi/design-system/Flex';
import { IconButton } from '@strapi/design-system/IconButton';
import { Typography } from '@strapi/design-system/Typography';
import { Icon } from '@strapi/design-system/Icon';
import { Pencil, Trash, Refresh, Drag } from '@strapi/icons/';

import Wrapper from './Wrapper';
import ItemCardBadge from '../ItemCardBadge';
import { getMessage } from '../../../utils';

const IconWrapper = styled.div`
display: flex;
align-items: center;
justify-content: center;
height: ${32 / 16}rem;
width: ${32 / 16}rem;

cursor: move;
  padding: ${({ theme }) => theme.spaces[2]};
  border-radius: ${({ theme }) => theme.borderRadius};
  background: ${({ theme }) => theme.colors.neutral0};
  border: 1px solid ${({ theme }) => theme.colors.neutral200};
	
svg {
	> g,
	path {
		fill: ${({ theme }) => theme.colors.neutral500};
	}
}
`

const ItemCardHeader = ({ title, path, icon, removed, onItemRemove, onItemEdit, onItemRestore, dragRef }) => {
	return (
		<Wrapper>
			<Flex alignItems="center">
				<IconWrapper ref={dragRef}>
					<Icon as={Drag} />
				</IconWrapper>
				<Typography variant="omega" fontWeight="bold">
					{title}
				</Typography>
				<Typography variant="omega" fontWeight="bold" textColor='neutral500'>
					{path}
				</Typography>
				<Icon as={icon} />
			</Flex>
			<Flex alignItems="center" style={{ zIndex: 2 }}>
				{removed &&
					(<ItemCardBadge
						borderColor={`danger200`}
						backgroundColor={`danger100`}
						textColor={`danger600`}
					>
						{getMessage("components.navigationItem.badge.removed")}
					</ItemCardBadge>)
				}

				<IconButton disabled={removed} onClick={onItemEdit} label="Edit" icon={<Pencil />} />
				{removed ?
					<IconButton onClick={onItemRestore} label="Restore" icon={<Refresh />} /> :
					<IconButton onClick={onItemRemove} label="Remove" icon={<Trash />} />
				}
			</Flex>
		</Wrapper>
	);
}

export default ItemCardHeader;