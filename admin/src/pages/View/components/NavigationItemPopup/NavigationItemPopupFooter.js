import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { Button } from '@strapi/design-system/Button';
import { ModalFooter } from '@strapi/design-system/ModalLayout';

import { getTrad } from '../../../../translations';

export const NavigationItemPopupFooter = ({ handleCancel, handleSubmit, submitDisabled, formViewId }) => {
	const { formatMessage } = useIntl();

	return (
		<ModalFooter
			startActions={
				<Button onClick={handleCancel} variant="tertiary">
					{formatMessage(getTrad('popup.item.form.button.cancel'))}
				</Button>
			}
			endActions={
				<Button onClick={handleSubmit} disabled={submitDisabled}>
					{formatMessage(getTrad(`popup.item.form.button.save`))}
				</Button>
			}
		/>
	);
};

NavigationItemPopupFooter.defaultProps = {
	onValidate: undefined,
	submitDisabled: false,
	formViewId: undefined,
};

NavigationItemPopupFooter.propTypes = {
	handleCancel: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func,
	submitDisabled: PropTypes.bool,
	formViewId: PropTypes.object,
};
