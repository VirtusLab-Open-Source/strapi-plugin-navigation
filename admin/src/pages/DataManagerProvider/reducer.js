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
  I18N_COPY_NAVIGATION_SUCCESS,
  I18N_COPY_NAVIGATION,
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
  i18nEnabled: false,
  availableLocale: [],
};

const reducer = (state, action) => produce(state, draftState => {
  switch (action.type) {
    case SUBMIT_NAVIGATION: {
      draftState.isLoadingForSubmit = true;
      draftState.error = undefined;
      break;
    }
    case SUBMIT_NAVIGATION_SUCCEEDED: {
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
    case I18N_COPY_NAVIGATION: {
      draftState.isLoading = true;
      break;
    }
    case I18N_COPY_NAVIGATION_SUCCESS: {
      draftState.isLoading = false;
      break;
    }
    default:
      return draftState;
  }
});

export default reducer;
export { initialState };
