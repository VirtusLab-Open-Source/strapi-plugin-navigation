/*
 *
 * Navigation View
 *
 */

import React, { memo } from 'react';
import useDataManager from "../../hooks/useDataManager";
import { Text } from '@strapi/design-system/Text';

const View = () => {
  const {
    items: availableNavigations,
    activeItem: activeNavigation,
    changedActiveItem: changedActiveNavigation,
    config,
    navigationItemPopupOpened,
    isLoading,
    isLoadingForAdditionalDataToBeSet,
    isLoadingForSubmit,
    handleChangeNavigationItemPopupVisibility,
    handleChangeSelection,
    handleChangeNavigationData,
    handleResetNavigationData,
    handleSubmitNavigation,
    getContentTypeItems,
    error
  } = useDataManager();
  return (
    <Text>To be migrated...</Text>
  )
};

export default memo(View);
