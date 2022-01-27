import produce from 'immer';

import {
  GET_LIST_DATA,
  GET_LIST_DATA_SUCCEEDED,
  GET_NAVIGATION_DATA,
  GET_NAVIGATION_DATA_SUCCEEDED,
  RELOAD_PLUGIN,
  RESET_NAVIGATION_DATA,
  CHANGE_NAVIGATION_POPUP_VISIBILITY,
  CHANGE_NAVIGATION_ITEM_POPUP_VISIBILITY,
  CHANGE_NAVIGATION_DATA,
  GET_CONFIG,
  GET_CONFIG_SUCCEEDED,
  GET_CONTENT_TYPE_ITEMS,
  GET_CONTENT_TYPE_ITEMS_SUCCEEDED,
  SUBMIT_NAVIGATION_SUCCEEDED,
  SUBMIT_NAVIGATION,
  SUBMIT_NAVIGATION_ERROR,
} from './actions';

const initialState = {
  items: [],
  activeItem: undefined,
  changedActiveItem: undefined,
  navigationPopupOpened: false,
  navigationItemPopupOpened: false,
  config: {},
  isLoading: true,
  isLoadingForDataToBeSet: false,
  isLoadingForDetailsDataToBeSet: false,
  isLoadingForAdditionalDataToBeSet: false,
  isLoadingForSubmit: false,
  error: undefined,
};

const reducer = (state, action) => produce(state, draftState => {
  switch (action.type) {
    case GET_CONFIG: {
      draftState.isLoadingForDetailsDataToBeSet = true;
      draftState.config = {};
      break;
    }
    case GET_CONFIG_SUCCEEDED: {
      draftState.isLoadingForDetailsDataToBeSet = false;
      draftState.config = action.config;
      break;
    }
    case GET_LIST_DATA: {
      draftState.items = [];
      draftState.isLoadingForDataToBeSet = true;
      break;
    }
    case GET_LIST_DATA_SUCCEEDED: {
      draftState.items = action.items;
      draftState.isLoading = false;
      draftState.isLoadingForDataToBeSet = false;
      break;
    }
    case GET_NAVIGATION_DATA: {
      draftState.activeItem = undefined;
      draftState.changedActiveItem = undefined;
      draftState.isLoadingForDetailsDataToBeSet = true;
      break;
    }
    case GET_NAVIGATION_DATA_SUCCEEDED: {
      const activeItem = action.activeItem || {};
      draftState.activeItem = activeItem;
      draftState.changedActiveItem = activeItem;
      draftState.isLoadingForDetailsDataToBeSet = false;
      break;
    }
    case CHANGE_NAVIGATION_DATA: {
      draftState.changedActiveItem = action.changedActiveItem;
      draftState.navigationPopupOpened = action.forceClosePopups ? false : state.navigationPopupOpened;
      draftState.navigationItemPopupOpened = action.forceClosePopups ? false : state.navigationItemPopupOpened;
      break;
    }
    case RESET_NAVIGATION_DATA : {
      draftState.changedActiveItem = action.activeItem || {};
      break;
    }
    case GET_CONTENT_TYPE_ITEMS: {
      draftState.isLoadingForAdditionalDataToBeSet = true;
      break;
    }
    case GET_CONTENT_TYPE_ITEMS_SUCCEEDED: {
      draftState.isLoadingForAdditionalDataToBeSet = false;
      draftState.config.contentTypeItems = action.contentTypeItems;
      break;
    }
    case CHANGE_NAVIGATION_POPUP_VISIBILITY: {
      draftState.navigationPopupOpened = action.navigationPopupOpened;
      break;
    }
    case CHANGE_NAVIGATION_ITEM_POPUP_VISIBILITY: {
      draftState.navigationItemPopupOpened = action.navigationItemPopupOpened;
      break;
    }
    case SUBMIT_NAVIGATION: {
      draftState.isLoadingForSubmit = true;
      draftState.error = undefined;
      break;
    }
    case SUBMIT_NAVIGATION_SUCCEEDED: {
      draftState.activeItem = action.navigation || {};
      draftState.changedActiveItem = action.navigation || {};
      draftState.isLoadingForSubmit = false;
      break;
    }
    case SUBMIT_NAVIGATION_ERROR: {
      draftState.isLoadingForSubmit = false;
      draftState.error = action.error;
      break;
    }
    case RELOAD_PLUGIN: {
      return initialState;
    }
    default:
      return draftState;
  }
});

export default reducer;
export { initialState };
