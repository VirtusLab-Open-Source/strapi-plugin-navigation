import React from 'react';
import { useIntl } from 'react-intl';

import { Flex } from '@strapi/design-system/Flex';
import { IconButton } from '@strapi/design-system/IconButton';
import { Typography } from '@strapi/design-system/Typography';
import DragIcon from '@strapi/icons/Drag';
import PencilIcon from '@strapi/icons/Pencil';
import TrashIcon from '@strapi/icons/Trash';

import Wrapper from './Wrapper';
import ItemCardBadge from '../ItemCardBadge';
import { getTradId } from "../../../translations";

const ItemCardHeader = ({ title, path, icon, isPublished }) => {
	const badgeColor = isPublished ? 'success' : 'secondary';
	const { formatMessage } = useIntl();

	return (
		<Wrapper>
			<Flex alignItems="center">
				{icon}
				<Typography variant="omega" fontWeight="bold">
					{title}
				</Typography>
				<Typography variant="omega" fontWeight="bold" textColor='neutral500'>
					{path}
				</Typography>
			</Flex>
			<Flex alignItems="center">
				<ItemCardBadge
					borderColor={`${badgeColor}200`}
					backgroundColor={`${badgeColor}100`}
					textColor={`${badgeColor}600`}
					className="action"
				>
					{
						formatMessage({
							id: getTradId(`notification.navigation.item.relation.status.${isPublished ? 'published' : 'draft'}`),
							defaultMessage: isPublished ? 'published' : 'draft'
						})
					}
				</ItemCardBadge>

				<IconButton onClick={() => console.log('Edit')} label="Edit" icon={<PencilIcon />} />
				<IconButton onClick={() => console.log('Remove')} label="Remove" icon={<TrashIcon />} />
				<IconButton onClick={() => console.log('Drag')} label="Drag" icon={<DragIcon />} />
			</Flex>
		</Wrapper>
	);
}

export default ItemCardHeader;