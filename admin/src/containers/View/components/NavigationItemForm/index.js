import React, { useState, useEffect } from "react";
import { Button, Enumeration, Flex, Label, Text, Toggle } from "@buffetjs/core";
import { useIntl } from "react-intl";
import { find, get, isEmpty, isNil, isString } from "lodash";
import PropTypes from "prop-types";
import { ButtonModal, ModalBody, ModalForm } from "strapi-helper-plugin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faEye } from "@fortawesome/free-solid-svg-icons";
import ModalFooter from "./ModalFooter";
import Input from "../../../../components/Input";
import pluginId from "../../../../pluginId";
import { navigationItemAdditionalFields, navigationItemType } from "../../utils/enums";
import slugify from "slugify";
import Select from "../../../../components/Select";
import { extractRelatedItemLabel } from "../../utils/parsers";
import { form as formDefinition } from './utils/form';
import { checkFormValidity } from "../../utils/form";

const NavigationItemForm = ({
  isLoading,
  inputsPrefix,
  data = {},
  contentTypes = [],
  contentTypeEntities = [],
  usedContentTypeEntities = [],
  availableAudience = [],
  additionalFields = [],
  onSubmit,
  getContentTypeEntities,
}) => {
  const [hasBeenInitialized, setInitializedState] = useState(false);
  const [hasChanged, setChangedState] = useState(false);
  const [form, setFormState] = useState({});
  const [formErrors, setFormErrorsState] = useState({});
  const { relatedType } = form;
  const { formatMessage } = useIntl();

  if (!hasBeenInitialized && !isEmpty(data)) {
    setInitializedState(true);
    setFormState({ ...data });
  } else if (hasBeenInitialized && !isEmpty(data) && data.related && data.related.label && !(form.related || {}).label) {
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
    };
  }

  const handleSubmit = async e => {
    if (e) {
      e.preventDefault();
    }

    const payload = sanitizePayload(form);
    const errors = await checkFormValidity(payload, formDefinition.schema);
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
  }

  const onChange = ({ target: { name, value } }) => {
    setFormState({
      ...form,
      updated: true,
      [name]: value,
    });
    if (!hasChanged) {
      setChangedState(true);
    }
  };

  const generateUiRouterKey = (force = false) => {
    if (force || isEmpty(form.uiRouterKey)) {
      onChange({ target: {
        name: 'uiRouterKey',
        value: isString(form.title) && !isEmpty(form.title) ? slugify(form.title).toLowerCase() : undefined,
      }});
    }
  };

  const typeSelectValue = get(form, "type", navigationItemType.INTERNAL);
  const typeSelectOptions = Object.keys(navigationItemType).map((key) => ({
    value: key,
    label: formatMessage({
      id: `${pluginId}.popup.item.form.type.${key.toLowerCase()}.label`,
    }),
  }));

  const relatedTypeSelectValue = get(form, "relatedType", undefined);
  const relatedTypeSelectOptions = contentTypes.map((item) => ({
      value: get(item, "collectionName"),
      label: get(item, "label", get(item, "name")),
    }));

  const relatedSelectValue = get(form, "related", undefined);
  const relatedSelectOptions = contentTypeEntities
    .filter((item) => !find(usedContentTypeEntities.filter(uctItem => uctItem.id !== get(relatedSelectValue, 'value')), uctItem =>
        (get(relatedTypeSelectValue, 'value') === uctItem.__collectionName) && (item.id === uctItem.id) 
      ))
    .map((item) => ({
      value: item.id,
      label: extractRelatedItemLabel(item),
    }));

  const isExternal = form.type === navigationItemType.EXTERNAL;
  const pathSourceName = isExternal ? "externalPath" : "path";

  const audience = get(form, `${inputsPrefix}audience`, []);
  const audienceOptions = availableAudience.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const generatePreviewPath = () => {
    if (!isExternal && data.levelPath) {
      return (<Text fontSize="sm" color="grey">
          <FontAwesomeIcon icon={faEye}/>{ ' ' }
          { formatMessage({
            id: `${pluginId}.popup.item.form.path.preview`,
          }) }{ ' ' }
          {data.levelPath !== '/' ? `${data.levelPath}`  : ''}/{form.path}
        </Text>);
    }
    return null;
  }

  useEffect(() => {
    const { value } = relatedType || {};
    const fetchContentTypeEntities = async () => {
      if (value) {
        const item = find(
          contentTypes,
          (_) => _.collectionName === value,
        );
        if (item) {
          await getContentTypeEntities(item.endpoint || item.collectionName, item.plugin);
        }
      }
    };
    fetchContentTypeEntities();
  }, [relatedType]);

  return (
    <form onSubmit={handleSubmit}>
      <ModalForm>
        <ModalBody>
          <section className="col-12">
            <div className="row">
              <div className="col-lg-6 col-md-12">
                <Input
                  autoFocus
                  error={get(formErrors, `${inputsPrefix}title`)}
                  label={`${pluginId}.popup.item.form.title.label`}
                  name={`${inputsPrefix}title`}
                  onChange={onChange}
                  onBlur={() => generateUiRouterKey()}
                  placeholder={`${pluginId}.popup.item.form.title.placeholder`}
                  type="text"
                  validations={{ required: true }}
                  value={get(form, `${inputsPrefix}title`, "")}
                />
              </div>
              <div className="col-lg-4 col-md-12">
                <Input
                  error={get(formErrors, `${inputsPrefix}uiRouterKey`)}
                  label={`${pluginId}.popup.item.form.uiRouterKey.label`}
                  name={`${inputsPrefix}uiRouterKey`}
                  onChange={onChange}
                  placeholder={`${pluginId}.popup.item.form.uiRouterKey.placeholder`}
                  type="text"
                  validations={{ required: true }}
                  value={get(form, `${inputsPrefix}uiRouterKey`, "")}
                />
              </div>
              <div className="col-lg-2 col-md-12">
                <Flex alignItems="flex-start" flexWrap="wrap">
                  <Label
                    htmlFor={`${inputsPrefix}menuAttached`}
                    style={{ display: "block" }}
                    message={formatMessage({
                      id: `${pluginId}.popup.item.form.menuAttached.label`,
                    })}
                  />
                  <Toggle
                    name={`${inputsPrefix}menuAttached`}
                    onChange={onChange}
                    disabled={!data.isMenuAllowedLevel}
                    value={get(form, `${inputsPrefix}menuAttached`, false)}
                  />
                </Flex>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-7 col-md-12">
                <Input
                  error={get(formErrors, `${inputsPrefix}${pathSourceName}`)}
                  label={`${pluginId}.popup.item.form.${pathSourceName}.label`}
                  name={`${inputsPrefix}${pathSourceName}`}
                  onChange={onChange}
                  placeholder={`${pluginId}.popup.item.form.${pathSourceName}.placeholder`}
                  description={generatePreviewPath()}
                  type="text"
                  validations={{ required: true }}
                  value={get(form, `${inputsPrefix}${pathSourceName}`, "")}
                />
              </div>
              <div className="col-lg-5 col-md-12">
                <Label
                  htmlFor={`${inputsPrefix}type`}
                  message={formatMessage({
                    id: `${pluginId}.popup.item.form.type.label`,
                  })}
                />
                <Enumeration
                  name={`${inputsPrefix}type`}
                  onChange={onChange}
                  options={typeSelectOptions}
                  value={typeSelectValue}
                />
              </div>
            </div>
            { additionalFields.includes(navigationItemAdditionalFields.AUDIENCE) && (<div className="row">
              <div className="col-lg-12">
                <Label
                  htmlFor={`${inputsPrefix}audience`}
                  message={formatMessage({
                    id: `${pluginId}.popup.item.form.audience.label`,
                  })}
                />
                <Select
                  name={`${inputsPrefix}audience`}
                  onChange={onChange}
                  options={audienceOptions}
                  isMulti={true}
                  value={audience}
                />
              </div>
            </div>) }
            {!isExternal && (
              <>
                <div className="row">
                  <div className="col-lg-12">
                    <hr />
                    <Label
                      message={formatMessage({
                        id: `${pluginId}.popup.item.form.relatedSection.label`,
                      })}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6 col-md-12">
                    <Label
                      htmlFor={`${inputsPrefix}relatedType`}
                      message={formatMessage({
                        id: `${pluginId}.popup.item.form.relatedType.label`,
                      })}
                    />
                    <Select
                      name={`${inputsPrefix}relatedType`}
                      error={get(formErrors, `${inputsPrefix}relatedType`)}
                      onChange={onChange}
                      options={relatedTypeSelectOptions}
                      value={relatedTypeSelectValue}
                    />
                  </div>
                  {relatedTypeSelectValue && (
                    <div className="col-lg-6 col-md-12">
                      <Label
                        htmlFor={`${inputsPrefix}related`}
                        message={formatMessage({
                          id: `${pluginId}.popup.item.form.related.label`,
                        })}
                      />
                      <Select
                        name={`${inputsPrefix}related`}
                        error={get(formErrors, `${inputsPrefix}related`)}
                        onChange={onChange}
                        isLoading={isLoading}
                        isDisabled={isEmpty(relatedSelectOptions)}
                        options={relatedSelectOptions}
                        value={relatedSelectValue}
                      />
                      { !isLoading && isEmpty(relatedSelectOptions) && (
                        <Text
                          color="orange"
                          fontSize="sm"
                        >
                        <FontAwesomeIcon icon={faInfoCircle}/>{ ' ' }
                        {formatMessage({
                          id: `${pluginId}.popup.item.form.related.empty`,
                        })}
                      </Text>) }
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
            label={formatMessage({
              id: `${pluginId}.popup.item.form.button.remove`
            })}
          />
        </section>
        <section>
          <ButtonModal
            onClick={handleSubmit}
            message={`${pluginId}.popup.item.form.button.${
              form.viewId ? "update" : "create"
            }`}
          />
        </section>
      </ModalFooter>
    </form>
  );
};

NavigationItemForm.defaultProps = {
  fieldsToDisable: [],
  formErrors: {},
  inputsPrefix: "",
  onSubmit: (e) => e.preventDefault(),
  requestError: null,
};

NavigationItemForm.propTypes = {
  isLoading: PropTypes.bool,
  fieldsToDisable: PropTypes.array,
  formErrors: PropTypes.object.isRequired,
  inputsPrefix: PropTypes.string,
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  requestError: PropTypes.object,
  contentTypes: PropTypes.array,
  contentTypeEntities: PropTypes.array,
  usedContentTypeEntities: PropTypes.array,
  availableAudience: PropTypes.array,
  additionalFields: PropTypes.array,
  getContentTypeEntities: PropTypes.func.isRequired,
};

export default NavigationItemForm;
