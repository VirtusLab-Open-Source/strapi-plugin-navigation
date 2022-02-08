import React, { useEffect } from 'react';
import { Formik } from 'formik';
import { useIntl } from 'react-intl';
import {
	CheckPermissions,
	LoadingIndicatorPage,
	Form,
} from '@strapi/helper-plugin';

import { Main } from '@strapi/design-system/Main';
import { ContentLayout, HeaderLayout } from '@strapi/design-system/Layout';
import { Button } from '@strapi/design-system/Button';
import { Box } from '@strapi/design-system/Box';
import { Stack } from '@strapi/design-system/Stack';
import { Typography } from '@strapi/design-system/Typography';
import { Grid, GridItem } from '@strapi/design-system/Grid';
import { ToggleInput } from '@strapi/design-system/ToggleInput';
import { NumberInput } from '@strapi/design-system/NumberInput';
import { Select, Option } from '@strapi/design-system/Select';
import { Check, Refresh } from '@strapi/icons';

import { getTrad } from '../../translations';
import permissions from '../../permissions';
import useNavigationConfig from '../../hooks/useNavigationConfig';
import useAllContentTypes from '../../hooks/useAllContentTypes';
import { navigationItemAdditionalFields } from '../View/utils/enums';


const SettingsPage = () => {
	const { formatMessage } = useIntl();
	const { data: navigationConfigData, isLoading: isConfigLoading, err: configErr, submitMutation, restoreMutation } = useNavigationConfig();
	const { data: allContentTypesData, isLoading: isContentTypesLoading, err: contentTypesErr } = useAllContentTypes();
	const isLoading = isConfigLoading || isContentTypesLoading;
	const isError = configErr || contentTypesErr;

	const onSave = (form) => {
		submitMutation.mutate({
			body: {
				contentTypes: form.selectedContentTypes,
				additionalFields: form.audienceFieldChecked ? [navigationItemAdditionalFields.AUDIENCE] : [],
				allowedLevels: form.allowedLevels,
				gql: {
					navigationItemRelated: form.selectedGraphqlTypes
				}
			}
		});
	}

	const onRestore = (form) => {
		restoreMutation.mutate({});
	}

	if (isLoading || isError) {
		return (
			<LoadingIndicatorPage>
				Fetching plugin config...
			</LoadingIndicatorPage>
		)
	}

	const allContentTypes = !isLoading && Object.values(allContentTypesData).filter(item => item.uid.includes('api::'));
	const selectedContentTypes = navigationConfigData?.contentTypes.map(item => item.uid);
	const audienceFieldChecked = navigationConfigData?.additionalFields.includes(navigationItemAdditionalFields.AUDIENCE);
	const allowedLevels = navigationConfigData?.allowedLevels;

	return (
		<Main>
			<Formik
				initialValues={{
					selectedContentTypes,
					audienceFieldChecked,
					allowedLevels,
					selectedGraphqlTypes: [],
				}}
				onSubmit={onSave}
			>
				{({ handleSubmit, setFieldValue, values }) => (
					<Form noValidate onSubmit={handleSubmit}>
						<HeaderLayout
							title={formatMessage(getTrad('pages.settings.header.title'))}
							subtitle={formatMessage(getTrad('pages.settings.header.description'))}
							primaryAction={
								<CheckPermissions permissions={permissions.access}>
									<Button type="submit" startIcon={<Check />} >
										{formatMessage(getTrad('pages.settings.actions.submit'))}
									</Button>
								</CheckPermissions>
							}
						/>
						<ContentLayout>
							<Box
								background="neutral0"
								hasRadius
								shadow="filterShadow"
								paddingTop={6}
								paddingBottom={6}
								paddingLeft={7}
								paddingRight={7}
							>
								<Stack size={4}>
									<Typography variant="delta" as="h2">
										{formatMessage(getTrad('pages.SettingsPage.title'))}
									</Typography>
									<Grid gap={4}>
										<GridItem col={12}>
											<Select
												name="selectedContentTypes"
												label={formatMessage(getTrad('pages.settings.form.contentTypes.label'))}
												placeholder={formatMessage(getTrad('pages.settings.form.contentTypes.placeholder'))}
												hint={formatMessage(getTrad('pages.settings.form.contentTypes.hint'))}
												onClear={() => setFieldValue('selectedContentTypes', [], false)}
												value={values.selectedContentTypes}
												onChange={(value) => setFieldValue('selectedContentTypes', value, false)}
												multi
												withTags
											>
												{allContentTypes.map(({ uid, info }) => <Option key={uid} value={uid}>{info.displayName}</Option>)}
											</Select>
										</GridItem>
										<GridItem col={6}>
											<NumberInput
												name="allowedLevels"
												label={formatMessage(getTrad('pages.settings.form.allowedLevels.label'))}
												placeholder={formatMessage(getTrad('pages.settings.form.allowedLevels.placeholder'))}
												hint={formatMessage(getTrad('pages.settings.form.allowedLevels.hint'))}
												onValueChange={(value) => setFieldValue('allowedLevels', value, false)}
												value={values.allowedLevels}
											/>
										</GridItem>
										<GridItem col={6} />
										<GridItem col={6}>
											<ToggleInput
												name="audienceFieldChecked"
												label={formatMessage(getTrad('pages.settings.form.audience.label'))}
												hint={formatMessage(getTrad('pages.settings.form.audience.hint'))}
												checked={values.audienceFieldChecked}
												onChange={({ target: { checked } }) => setFieldValue('audienceFieldChecked', checked, false)}
												onLabel="Enabled"
												offLabel="Disabled"
											/>
										</GridItem>
										<GridItem col={12}>
											<Select
												name="selectedGraphqlTypes"
												label={formatMessage(getTrad('pages.settings.form.graphql.label'))}
												placeholder={formatMessage(getTrad('pages.settings.form.graphql.placeholder'))}
												hint={formatMessage(getTrad('pages.settings.form.graphql.hint'))}
												onClear={() => setValues([])}
												value={values.selectedGraphqlTypes}
												onChange={(value) => setFieldValue('selectedGraphqlTypes', value, false)}
												multi
												withTags
											>
												{allContentTypes.map(({ info: { displayName } }) => <Option key={displayName} value={displayName}>{displayName}</Option>)}
											</Select>
										</GridItem>
										<GridItem col={6}>
											<CheckPermissions permissions={permissions.access}>
												<Button variant="tertiary" startIcon={<Refresh />} onClick={onRestore}>
													{formatMessage(getTrad('pages.settings.actions.restore'))}
												</Button>
											</CheckPermissions>
										</GridItem>
									</Grid>
								</Stack>
							</Box>
						</ContentLayout>
					</Form>
				)}
			</Formik>
		</Main>
	);
}


export default SettingsPage;