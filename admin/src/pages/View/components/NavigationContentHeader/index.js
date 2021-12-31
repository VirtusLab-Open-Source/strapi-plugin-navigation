import React from 'react';

import { Flex } from '@strapi/design-system/Flex';

const NavigationContentHeader = ({ startActions, endActions }) => {
	return (
			<Flex justifyContent="space-between" width="100%">
				<Flex alignItems="space-between">
					{startActions}
				</Flex>
				<Flex alignItems="space-between">
					{endActions}
				</Flex>
			</Flex>
	);
}

export default NavigationContentHeader;
