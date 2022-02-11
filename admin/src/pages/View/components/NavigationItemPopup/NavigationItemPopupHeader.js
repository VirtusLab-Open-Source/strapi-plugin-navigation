

import React from 'react';
import { ButtonText } from '@strapi/design-system/Text';
import { ModalHeader } from '@strapi/design-system/ModalLayout';
import { getMessage } from '../../../../utils';

export const NavigationItemPopupHeader = ({isNewItem}) => {
	return (
		<ModalHeader>
			<ButtonText textColor="neutral800" as="h2" id="asset-dialog-title">
				{getMessage(`popup.item.header.${isNewItem ? 'new' : 'edit'}`)}
			</ButtonText>
		</ModalHeader>
	);
};