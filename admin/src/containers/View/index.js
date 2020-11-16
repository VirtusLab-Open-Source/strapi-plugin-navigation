/*
 *
 * Navigation View
 *
 */

import React, { memo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { LoadingIndicatorPage } from "strapi-helper-plugin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHamburger, faPlus } from "@fortawesome/free-solid-svg-icons";
import useDataManager from "../../hooks/useDataManager";
import { isEmpty, get } from "lodash";
import { Header } from "@buffetjs/custom";
import { Button, HeaderActions, Select } from "@buffetjs/core";
import Wrapper from "../View/Wrapper";
import EmptyView from "../../components/EmptyView";
import HeaderForm from "./HeaderForm";
import HeaderFormCell from "./HeaderFormCell";
import pluginId from "../../pluginId";
import NavigationItemPopUp from "./components/NavigationItemPopup";
import List from "../../components/List";
import {
  transformItemToViewPayload,
  transformToRESTPayload,
} from "./utils/parsers";
import FadedWrapper from "./FadedWrapper";

const View = () => {
  const {
    items: availableNavigations,
    activeItem: activeNavigation,
    changedActiveItem: changedActiveNavigation,
    config,
    navigationPopupOpened,
    navigationItemPopupOpened,
    isLoading,
    isLoadingForAdditionalDataToBeSet,
    isLoadingForSubmit,
    handleChangeNavigationPopupVisibility,
    handleChangeNavigationItemPopupVisibility,
    handleChangeSelection,
    handleChangeNavigationData,
    handleResetNavigationData,
    handleSubmitNavigation,
    getContentTypeItems,
  } = useDataManager();
  const [activeNavigationItem, setActiveNavigationItemState] = useState({});
  const { formatMessage } = useIntl();

  const options = availableNavigations.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const navigationSelectValue = get(activeNavigation, "id", null);
  const actions = [
    {
      label: "Cancel",
      onClick: () => isLoadingForSubmit ? null : handleResetNavigationData(),
      color: "cancel",
      type: "button",
    },
    {
      label: "Save",
      onClick: () =>
        isLoadingForSubmit ? null : handleSubmitNavigation(formatMessage, transformToRESTPayload(changedActiveNavigation, config)),
      color: "success",
      type: "submit",
      isLoading: isLoadingForSubmit,
    },
  ];

  const pullUsedContentTypeItem = (items = []) =>
    items.reduce((prev, curr) =>
      [...prev, curr.relatedRef ? {
        __collectionName: curr.relatedRef.__collectionName,
        id: curr.relatedRef.id
      } : undefined, ...pullUsedContentTypeItem(curr.items)].filter(item => item)
    , [])
  const usedContentTypeItems = pullUsedContentTypeItem((changedActiveNavigation || {}).items);

  const changeNavigationItemPopupState = (visible, editedItem = {}) => {
    setActiveNavigationItemState(editedItem);
    handleChangeNavigationItemPopupVisibility(visible);
  };

  const addNewNavigationItem = (
    e,
    viewId = null,
    isMenuAllowedLevel = true,
    levelPath = '',
  ) => {
    e.preventDefault();
    e.stopPropagation();
    changeNavigationItemPopupState(true, {
      viewParentId: viewId,
      isMenuAllowedLevel,
      levelPath,
    });
  };

  const editNavigationItem = (e, item, levelPath = '') => {
    e.preventDefault();
    e.stopPropagation();
    changeNavigationItemPopupState(true, {
      ...item,
      levelPath,
    });
  };

  const restoreNavigationItem = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    handleSubmitNavigationItem({
      ...item,
      removed: false,
    });
  };

  const reOrderNavigationItem = (e, item, moveBy = 0) => {
    e.preventDefault();
    e.stopPropagation();

    handleSubmitNavigationItem({
      ...item,
      order: item.order + (moveBy * 1.5),
    });
  }

  const onPopUpClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    changeNavigationItemPopupState(false);
  };

  const handleSubmitNavigationItem = (payload) => {
    const changedStructure = {
      ...changedActiveNavigation,
      items: transformItemToViewPayload(payload, changedActiveNavigation.items, config),
    };
    handleChangeNavigationData(changedStructure, true);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Wrapper className="col-md-12">
          <HeaderForm>
            <HeaderFormCell>
              <Header
                title={{
                  label: formatMessage({ id: `${pluginId}.header.title` }),
                }}
                content={formatMessage({
                  id: `${pluginId}.header.description`,
                })}
              />
            </HeaderFormCell>
            { options && (options.length > 1) && (<HeaderFormCell>
              <Select
                name="activeNavigation"
                onChange={({ target: { value } }) =>
                  handleChangeSelection(value)
                }
                options={options}
                value={navigationSelectValue}
              />
            </HeaderFormCell>) }
            <HeaderFormCell align="right" fill>
              <HeaderActions actions={actions} />
            </HeaderFormCell>
          </HeaderForm>
          <FadedWrapper>
            {isLoading && <LoadingIndicatorPage />}
            {changedActiveNavigation && (
              <>
                {isEmpty(changedActiveNavigation.items || []) && (
                  <EmptyView>
                    <FontAwesomeIcon icon={faHamburger} size="5x" />
                    <FormattedMessage id={`${pluginId}.empty`} />
                    <Button
                      color="primary"
                      icon={<FontAwesomeIcon icon={faPlus} />}
                      label={formatMessage({ id: `${pluginId}.empty.cta` })}
                      onClick={addNewNavigationItem}
                    />
                  </EmptyView>
                )}
                {!isEmpty(changedActiveNavigation.items || []) && (
                  <List
                    items={changedActiveNavigation.items || []}
                    onItemClick={editNavigationItem}
                    onItemReOrder={reOrderNavigationItem}
                    onItemRestoreClick={restoreNavigationItem}
                    onItemLevelAddClick={addNewNavigationItem}
                    root
                    allowedLevels={config.allowedLevels}
                  />
                )}
              </>
            )}
          </FadedWrapper>
          <NavigationItemPopUp
            isOpen={navigationItemPopupOpened}
            isLoading={isLoadingForAdditionalDataToBeSet}
            data={activeNavigationItem}
            config={config}
            usedContentTypeItems={usedContentTypeItems}
            getContentTypeItems={getContentTypeItems}
            onSubmit={handleSubmitNavigationItem}
            onClose={onPopUpClose}
          />
        </Wrapper>
      </div>
    </div>
  );
};

export default memo(View);
