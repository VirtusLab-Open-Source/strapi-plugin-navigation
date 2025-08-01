import { useCallback, useState } from 'react';
import { NavigationItemFormSchema } from '../components/NavigationItemForm';

export const useNavigationItemPopup = (canUpdate: boolean) => {
  const [activeNavigationItem, setActiveNavigationItemState] = useState<
    Partial<NavigationItemFormSchema> | undefined
  >();

  const [isItemPopupVisible, setIsItemPopupVisible] = useState(false);

  const changeNavigationItemPopupState = useCallback(
    (visible: boolean, editedItem = {}) => {
      setActiveNavigationItemState(editedItem);
      setIsItemPopupVisible(visible);
    },
    [setIsItemPopupVisible]
  );

  const closeNavigationItemPopup = useCallback(() => {
    changeNavigationItemPopupState(false);
  }, [changeNavigationItemPopupState]);

  const addNewNavigationItem = useCallback(
    (
      event: MouseEvent,
      viewParentId?: number,
      isMenuAllowedLevel = true,
      levelPath = '',
      parentAttachedToMenu = true,
      structureId = '0',
      maxOrder = 0
    ) => {
      if (canUpdate) {
        event.preventDefault();
        event.stopPropagation();

        changeNavigationItemPopupState(true, {
          viewParentId,
          isMenuAllowedLevel,
          levelPath,
          parentAttachedToMenu,
          structureId,
          viewId: undefined,
          order: maxOrder + 1,
        });
      }
    },
    [changeNavigationItemPopupState, canUpdate]
  );

  const editNavigationItem = useCallback(
    ({
      item,
      levelPath = '',
      parentAttachedToMenu = true,
    }: {
      item: NavigationItemFormSchema;
      levelPath?: string;
      parentAttachedToMenu?: boolean;
    }) => {
      changeNavigationItemPopupState(true, {
        ...item,
        levelPath,
        parentAttachedToMenu,
      });
    },
    [changeNavigationItemPopupState]
  );

  return {
    activeNavigationItem,
    addNewNavigationItem,
    editNavigationItem,
    closeNavigationItemPopup,
    isItemPopupVisible,
  };
};
