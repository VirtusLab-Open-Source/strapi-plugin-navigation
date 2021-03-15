import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Button, Enumeration, Flex, Label, Text, Toggle } from '@buffetjs/core';
import { useIntl } from 'react-intl';
import { debounce, find, get, isEmpty, isEqual, isNil, isString } from 'lodash';
import PropTypes from 'prop-types';
import { ButtonModal, ModalBody, ModalForm } from 'strapi-helper-plugin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import ModalFooter from './ModalFooter';
import Input from '../../../../components/Input';
import { navigationItemAdditionalFields, navigationItemType } from '../../utils/enums';
import slugify from 'slugify';
import Select from '../../../../components/Select';
import { extractRelatedItemLabel } from '../../utils/parsers';
import { form as formDefinition } from './utils/form';
import { checkFormValidity } from '../../utils/form';
import { getTrad, getTradId } from '../../../../translations';

const NavigationItemForm = ({
  isLoading,
  inputsPrefix,
  data = {},
  contentTypes = [],
  contentTypeEntities = [],
  usedContentTypeEntities = [],
  availableAudience = [],
  additionalFields = [],
  contentTypesNameFields = {},
  onSubmit,
  getContentTypeEntities,
  usedContentTypesData,
  appendLabelPublicationStatus = () => '',
}) => {
  const [hasBeenInitialized, setInitializedState] = useState(false);
  const [hasChanged, setChangedState] = useState(false);
  const [contentTypeSearchQuery, setContentTypeSearchQuery] = useState(undefined);
  const [contentTypeSearchInputValue, setContentTypeSearchInputValue] = useState(undefined);
  const [form, setFormState] = useState({});
  const [formErrors, setFormErrorsState] = useState({});
  const { relatedType } = form;
  const { formatMessage } = useIntl();

  const relatedFieldName = `${inputsPrefix}related`;

  if (!hasBeenInitialized && !isEmpty(data)) {
    setInitializedState(true);
    setFormState({ ...data });
  }

  const sanitizePayload = (payload = {}) => {
    const { onItemClick, onItemLevelAddClick, related, relatedType, menuAttached, ...purePayload } = payload;
    const sanitizedType = purePayload.type || navigationItemType.INTERNAL;
    return {
      ...purePayload,
      menuAttached: isNil(menuAttached) ? false : menuAttached,
      type: sanitizedType,
      path: sanitizedType === navigationItemType.INTERNAL ? purePayload.path : undefined,
      externalPath: sanitizedType === navigationItemType.EXTERNAL ? purePayload.externalPath : undefined,
      related: related ? related.value : undefined,
      relatedType: relatedType ? relatedType.value : undefined,
      isSingle: isSingleSelected,
      uiRouterKey: generateUiRouterKey(),
    };
  };

  const handleSubmit = async e => {
    if (e) {
      e.preventDefault();
    }

    const payload = sanitizePayload(form);
    const errors = await checkFormValidity(payload, formDefinition.schema(isSingleSelected));
    if (!errors || isEmpty(errors)) {
      return onSubmit(payload);
    } else {
      setFormErrorsState(errors);
    }
  };

  const handleRemove = e => {
    if (e) {
      e.preventDefault();
    }
    return onSubmit(sanitizePayload({
      ...form,
      removed: true,
    }));
  };

  const onChange = ({ target: { name, value } }) => {
    setFormState(prevState => ({
      ...prevState,
      updated: true,
      [name]: value,
    }));
    if (!hasChanged) {
      setChangedState(true);
    }
  };

  const onChangeRelatedType = ({ target: { name, value } }) => {
    const relatedTypeBeingReverted = data.relatedType && (data.relatedType.value === get(value, 'value', value));
    setContentTypeSearchQuery(undefined);
    setContentTypeSearchInputValue(undefined);
    setFormState(prevState => ({
      ...prevState,
      updated: true,
      related: relatedTypeBeingReverted ? {
        ...data.related
      } : undefined,
      [name]: value,
    }));
    if (!hasChanged) {
      setChangedState(true);
    }
  };

  const generateUiRouterKey = () => isString(form.title) && !isEmpty(form.title) ? slugify(form.title).toLowerCase() : undefined;

  const typeSelectValue = form.type || navigationItemType.INTERNAL;
  const relatedTypeSelectValue = form.relatedType;
  const relatedSelectValue = form.related;

  const typeSelectOptions = useMemo(
    () => Object.keys(navigationItemType).map((key) => ({
      value: key,
      label: formatMessage(getTrad(`popup.item.form.type.${key.toLowerCase()}.label`)),
    })),
    [],
  );

  const isSingleSelected = useMemo(
    () => relatedTypeSelectValue ? contentTypes.find(_ => _.uid === relatedType.value)?.isSingle : false,
    [relatedTypeSelectValue, contentTypes],
  );

  const relatedTypeSelectOptions = useMemo(
    () => contentTypes
    .filter((contentType) => {
      if (contentType.isSingle) {
        return !usedContentTypesData.some((_) => _.__collectionName === contentType.uid);
      }
      return true;
    })
      .map((item) => ({
        value: get(item, 'uid'),
        label: appendLabelPublicationStatus(get(item, 'label', get(item, 'name')), item, true),
      })),
    [contentTypes, usedContentTypesData],
  );

  const relatedSelectOptions = contentTypeEntities
    .filter((item) => {
      const usedContentTypeEntitiesOfSameType = usedContentTypeEntities
        .filter(uctItem => (get(relatedTypeSelectValue, 'value') === uctItem.__collectionName) && (uctItem.id !== get(relatedSelectValue, 'value')));
      return !find(usedContentTypeEntitiesOfSameType, uctItem => item.id === uctItem.id); 
    })
    .map((item) => ({
      value: item.id,
      label: appendLabelPublicationStatus(
          extractRelatedItemLabel({
          ...item,
          __collectionName: get(relatedTypeSelectValue, 'value', relatedTypeSelectValue),
        }, contentTypesNameFields, { contentTypes }), 
        item
      ),
    }));

  const isExternal = form.type === navigationItemType.EXTERNAL;
  const pathSourceName = isExternal ? 'externalPath' : 'path';

  const audience = get(form, `${inputsPrefix}audience`, []);
  const audienceOptions = availableAudience.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const submitDisabled = (form.type !== navigationItemType.EXTERNAL) && isNil(form.related);

  const generatePreviewPath = () => {
    if (!isExternal && data.levelPath) {
      return (
        <Text fontSize="sm" color="grey">
          <FontAwesomeIcon icon={faEye} />{' '}
          {formatMessage(getTrad('popup.item.form.path.preview'))}{' '}
          {data.levelPath !== '/' ? `${data.levelPath}` : ''}/{form.path}
        </Text>
      );
    }
    return null;
  };

  const debouncedSearch = useCallback(
    debounce(nextValue => setContentTypeSearchQuery(nextValue), 500),
		[],
	);

	const debounceContentTypeSearchQuery = value => {
    setContentTypeSearchInputValue(value);
		debouncedSearch(value);
	};

  const thereAreNoMoreContentTypes =  isEmpty(relatedSelectOptions) && !contentTypeSearchQuery;

  useEffect(
    () => {
      const value = get(relatedSelectOptions, '0');
      if (isSingleSelected && relatedSelectOptions.length === 1 && !isEqual(value, relatedSelectValue)) {
        onChange({ target: { name: relatedFieldName, value} });
      }
    },
    [isSingleSelected, relatedSelectOptions],
  );

  useEffect(() => {
    const { value } = relatedType || {};
    const fetchContentTypeEntities = async () => {
      if (value) {
        const item = find(
          contentTypes,
          (_) => _.uid === value,
        );
        if (item) {
          await getContentTypeEntities({ 
            type: item.endpoint || item.collectionName,
            query: contentTypeSearchQuery,
          }, item.plugin);
        }
      }
    };
    fetchContentTypeEntities();
  }, [relatedType, contentTypeSearchQuery]);

  return (
    <form onSubmit={handleSubmit}>
      <ModalForm>
        <ModalBody>
          <section className="col-12">
            <div className="row">
              <div className="col-lg-9 col-md-12">
                <Input
                  autoFocus
                  error={get(formErrors, `${inputsPrefix}title`)}
                  label={getTradId('popup.item.form.title.label')}
                  name={`${inputsPrefix}title`}
                  onChange={onChange}
                  placeholder={getTradId('popup.item.form.title.placeholder')}
                  type="text"
                  validations={{ required: true }}
                  value={get(form, `${inputsPrefix}title`, '')}
                />
              </div>
              <div className="col-lg-3 col-md-12">
                <Flex alignItems="flex-start" flexWrap="wrap">
                  <Label
                    htmlFor={`${inputsPrefix}menuAttached`}
                    style={{ display: 'block' }}
                    message={formatMessage(getTrad('popup.item.form.menuAttached.label'))}
                  />
                  <Toggle
                    name={`${inputsPrefix}menuAttached`}
                    onChange={onChange}
                    disabled={!(data.isMenuAllowedLevel && data.parentAttachedToMenu)}
                    value={get(form, `${inputsPrefix}menuAttached`, false)}
                  />
                </Flex>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-7 col-md-12">
                <Input
                  error={get(formErrors, `${inputsPrefix}${pathSourceName}`)}
                  label={getTradId(`popup.item.form.${pathSourceName}.label`)}
                  name={`${inputsPrefix}${pathSourceName}`}
                  onChange={onChange}
                  placeholder={getTradId(`popup.item.form.${pathSourceName}.placeholder`)}
                  description={generatePreviewPath()}
                  type="text"
                  validations={{ required: true }}
                  value={get(form, `${inputsPrefix}${pathSourceName}`, '')}
                />
              </div>
              <div className="col-lg-5 col-md-12">
                <Label
                  htmlFor={`${inputsPrefix}type`}
                  message={formatMessage(getTrad('popup.item.form.type.label'))}
                />
                <Enumeration
                  name={`${inputsPrefix}type`}
                  onChange={onChange}
                  options={typeSelectOptions}
                  value={typeSelectValue}
                />
              </div>
            </div>
            {additionalFields.includes(navigationItemAdditionalFields.AUDIENCE) && (<div className="row">
              <div className="col-lg-12">
                <Label
                  htmlFor={`${inputsPrefix}audience`}
                  message={formatMessage(getTrad('popup.item.form.audience.label'))}
                />
                <Select
                  name={`${inputsPrefix}audience`}
                  onChange={onChange}
                  options={audienceOptions}
                  isMulti={true}
                  value={audience}
                />
              </div>
            </div>)}
            {!isExternal && (
              <>
                <div className="row">
                  <div className="col-lg-12">
                    <hr />
                    <Label
                      message={formatMessage(getTrad('popup.item.form.relatedSection.label'))}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6 col-md-12">
                    <Label
                      htmlFor={`${inputsPrefix}relatedType`}
                      message={formatMessage(getTrad('popup.item.form.relatedType.label'))}
                    />
                    <Select
                      name={`${inputsPrefix}relatedType`}
                      error={get(formErrors, `${inputsPrefix}relatedType`)}
                      onChange={onChangeRelatedType}
                      options={relatedTypeSelectOptions}
                      value={relatedTypeSelectValue}
                    />
                  </div>
                  {relatedTypeSelectValue && !isSingleSelected && (
                    <div className="col-lg-6 col-md-12">
                      <Label
                        htmlFor={relatedFieldName}
                        message={formatMessage(getTrad('popup.item.form.related.label'))}
                      />
                      <Select
                        name={relatedFieldName}
                        error={get(formErrors, relatedFieldName)}
                        onChange={onChange}
                        onInputChange={debounceContentTypeSearchQuery}
                        inputValue={contentTypeSearchInputValue}
                        isLoading={isLoading}
                        options={relatedSelectOptions}
                        value={relatedSelectValue}
                      />
                      {!isLoading && thereAreNoMoreContentTypes && (
                        <Text
                          color="orange"
                          fontSize="sm"
                        >
                          <FontAwesomeIcon icon={faInfoCircle} />{' '}
                          {formatMessage(getTrad('popup.item.form.related.empty'), { contentTypeName: get(relatedTypeSelectValue, 'label') })}
                        </Text>)}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </ModalBody>
      </ModalForm>
      <ModalFooter>
        <section>
          <Button
            onClick={handleRemove}
            color="delete"
            label={formatMessage(getTrad('popup.item.form.button.remove'))}
          />
        </section>
        <section>
          <ButtonModal
            onClick={handleSubmit}
            disabled={submitDisabled}
            message={getTradId(`popup.item.form.button.${
              form.viewId ? 'update' : 'create'
            }`)}
          />
        </section>
      </ModalFooter>
    </form>
  );
};

NavigationItemForm.defaultProps = {
  fieldsToDisable: [],
  formErrors: {},
  inputsPrefix: '',
  onSubmit: (e) => e.preventDefault(),
  requestError: null,
};

NavigationItemForm.propTypes = {
  isLoading: PropTypes.bool,
  fieldsToDisable: PropTypes.array,
  formErrors: PropTypes.object.isRequired,
  inputsPrefix: PropTypes.string,
  data: PropTypes.object.isRequired,
  onSubmit: PropTypes.func,
  requestError: PropTypes.object,
  contentTypes: PropTypes.array,
  contentTypeEntities: PropTypes.array,
  usedContentTypeEntities: PropTypes.array,
  availableAudience: PropTypes.array,
  additionalFields: PropTypes.array,
  getContentTypeEntities: PropTypes.func.isRequired,
  appendLabelPublicationStatus: PropTypes.func,
};

export default NavigationItemForm;
