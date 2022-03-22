/**
 *
 * Entity Details
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@strapi/design-system/Button';
import { Dialog, DialogBody, DialogFooter } from '@strapi/design-system/Dialog';
import { Flex } from '@strapi/design-system/Flex';
import { Stack } from '@strapi/design-system/Stack';
import { Typography } from '@strapi/design-system/Typography';
import { ExclamationMarkCircle, Check } from '@strapi/icons';
import { getMessage } from '../../utils';

const ConfirmationDialog = ({
	isVisible = false,
	isActionAsync = false,
	children,
	onConfirm,
	onCancel,
	header,
	labelCancel,
	labelConfirm,
	iconConfirm
}) => (
	<Dialog onClose={onCancel} title={header || getMessage('components.confirmation.dialog.header', 'Confirmation')} isOpen={isVisible}>
		<DialogBody icon={<ExclamationMarkCircle />}>
			<Stack spacing={2}>
				<Flex justifyContent="center">
					<Typography id="dialog-confirm-description">{children || getMessage('components.confirmation.dialog.description')}</Typography>
				</Flex>
			</Stack>
		</DialogBody>
		<DialogFooter startAction={<Button onClick={onCancel} variant="tertiary" disabled={isActionAsync}>
			{labelCancel || getMessage('components.confirmation.dialog.button.cancel', 'Cancel')}
		</Button>} endAction={<Button onClick={onConfirm} variant="danger-light" startIcon={iconConfirm || <Check />} disabled={isActionAsync}>
			{labelConfirm || getMessage('components.confirmation.dialog.button.confirm', 'Confirm')}
		</Button>} />
	</Dialog>
);

ConfirmationDialog.propTypes = {
	isVisible: PropTypes.bool,
	isActionAsync: PropTypes.bool,
	children: PropTypes.string.isRequired,
	header: PropTypes.string,
	labelCancel: PropTypes.string,
	labelConfirm: PropTypes.string,
	iconConfirm: PropTypes.object,
	onConfirm: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired,
};

export default ConfirmationDialog;