

import React from 'react';
import { ButtonText } from '@strapi/design-system/Text';
import { ModalHeader } from '@strapi/design-system/ModalLayout';
import { useIntl } from 'react-intl';
import { getTrad } from '../../../../translations';

export const NavigationItemPopupHeader = () => {
	const { formatMessage } = useIntl();
	return (
		<ModalHeader>
			<ButtonText textColor="neutral800" as="h2" id="asset-dialog-title">
				{formatMessage(
					getTrad('popup.item.header'),
				)}
			</ButtonText>
		</ModalHeader>
	);
};