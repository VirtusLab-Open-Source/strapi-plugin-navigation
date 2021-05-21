import { fromJS } from "immutable";
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

const initialState = fromJS({
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
});

const reducer = (state, action) => {
  switch (action.type) {
    case GET_CONFIG: {
      return state
        .update("isLoadingForAdditionalDataToBeSet", () => true)
        .removeIn("config");
    }
    case GET_CONFIG_SUCCEEDED: {
      return state
        .update("isLoadingForAdditionalDataToBeSet", () => false)
        .update("config", () => fromJS(action.config));
    }
    case GET_LIST_DATA: {
      return state
        .removeIn("items")
        .update("isLoadingForDataToBeSet", () => true);
    }
    case GET_LIST_DATA_SUCCEEDED: {
      return state
        .update("items", () => fromJS(action.items))
        .update("isLoading", () => false)
        .update("isLoadingForDataToBeSet", () => false);
    }
    case GET_NAVIGATION_DATA: {
      return state
        .removeIn("activeItem")
        .removeIn("changedActiveItem")
        .update("isLoadingForDetailsDataToBeSet", () => true);
    }
    case GET_NAVIGATION_DATA_SUCCEEDED: {
      const { activeItem = {} } = action;
      return state
        .update("activeItem", () => fromJS(activeItem))
        .update("changedActiveItem", () => fromJS(activeItem))
        .update("isLoadingForDetailsDataToBeSet", () => false);
    }
    case CHANGE_NAVIGATION_DATA: {
      return state
        .update("changedActiveItem", () => action.changedActiveItem)
        .update("navigationPopupOpened", () =>
          action.forceClosePopups ? false : state.navigationPopupOpened,
        )
        .update("navigationItemPopupOpened", () =>
          action.forceClosePopups ? false : state.navigationItemPopupOpened,
        );
    }
    case RESET_NAVIGATION_DATA: {
      const { activeItem = {} } = action;
      return state.update("changedActiveItem", () => activeItem);
    }
    case GET_CONTENT_TYPE_ITEMS: {
      return state.update("isLoadingForAdditionalDataToBeSet", () => true);
    }
    case GET_CONTENT_TYPE_ITEMS_SUCCEEDED: {
      return state
        .update("isLoadingForAdditionalDataToBeSet", () => false)
        .updateIn(["config", "contentTypeItems"], () =>
          fromJS(action.contentTypeItems),
        );
    }
    case CHANGE_NAVIGATION_POPUP_VISIBILITY: {
      return state.update(
        "navigationPopupOpened",
        () => action.navigationPopupOpened,
      );
    }
    case CHANGE_NAVIGATION_ITEM_POPUP_VISIBILITY: {
      return state.update(
        "navigationItemPopupOpened",
        () => action.navigationItemPopupOpened,
      );
    }
    case SUBMIT_NAVIGATION: {
      return state
        .update('isLoadingForSubmit', () => true)
        .update('error', () => undefined);
    }
    case SUBMIT_NAVIGATION_SUCCEEDED: {
      const { navigation = {} } = action;
      return state
        .update("activeItem", () => fromJS(navigation))
        .update("changedActiveItem", () => fromJS(navigation))
        .update(
          'isLoadingForSubmit',
          () => false,
        );
    }
    case SUBMIT_NAVIGATION_ERROR: {
      return state
        .update('isLoadingForSubmit', () => false)
        .update('error', () => action.error);
    }
    case RELOAD_PLUGIN:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
export { initialState };
