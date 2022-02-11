import React from 'react';

import { Flex } from '@strapi/design-system/Flex';
import { IconButton } from '@strapi/design-system/IconButton';
import { Typography } from '@strapi/design-system/Typography';
import { Icon } from '@strapi/design-system/Icon';
import { Pencil, Trash, Refresh } from '@strapi/icons/';

import Wrapper from './Wrapper';
import ItemCardBadge from '../ItemCardBadge';
import { getMessage } from '../../../utils';

const ItemCardHeader = ({ title, path, icon, removed, onItemRemove, onItemEdit, onItemRestore }) => {
	return (
		<Wrapper>
			<Flex alignItems="center">
				<Icon as={icon} />
				<Typography variant="omega" fontWeight="bold">
					{title}
				</Typography>
				<Typography variant="omega" fontWeight="bold" textColor='neutral500'>
					{path}
				</Typography>
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