import { useCallback } from 'react';
import { useIntl } from 'react-intl';

import { Plus } from '@strapi/icons';
import { Box, Button } from '@strapi/design-system';

import { ToBeFixed } from '../../../../../types';
import { changeCollapseItemDeep } from '../../../utils';
import { NavigationSchema } from '../../../../../api/validators';
import { getTrad } from '../../../../../translations';

type ManageNavigationItemsProps = {
  currentNavigation: NavigationSchema | undefined;
  setCurrentNavigation: (navigation: NavigationSchema) => void;
  canUpdate: boolean;
  addNewNavigationItem: (
    event: MouseEvent,
    viewParentId?: number,
    isMenuAllowedLevel?: boolean,
    levelPath?: string,
    parentAttachedToMenu?: boolean,
    structureId?: string,
    maxOrder?: number
  ) => void;
};

export const ManageNavigationItems: React.FC<ManageNavigationItemsProps> = ({
  currentNavigation,
  setCurrentNavigation,
  canUpdate,
  addNewNavigationItem,
}) => {
  const { formatMessage } = useIntl();

  const handleExpandAll = useCallback(() => {
    if (currentNavigation) {
      setCurrentNavigation({
        ...currentNavigation,
        items: currentNavigation.items.map((item) => changeCollapseItemDeep(item, false)),
      });
    }
  }, [setCurrentNavigation, currentNavigation, changeCollapseItemDeep]);

  const handleCollapseAll = useCallback(() => {
    if (currentNavigation) {
      setCurrentNavigation({
        ...currentNavigation,
        items: currentNavigation.items.map((item) => changeCollapseItemDeep(item, true)),
      });
    }
  }, [setCurrentNavigation, currentNavigation, changeCollapseItemDeep]);

  const handleNewNavigationItem = useCallback(
    (event: MouseEvent) => {
      const maxOrder = (currentNavigation?.items ?? []).reduce(
        (acc, { order }) => Math.max(acc, order),
        0
      );
      addNewNavigationItem(event, undefined, true, '', true, currentNavigation?.items.length.toString(), maxOrder + 1);
    },
    [addNewNavigationItem, currentNavigation?.items]
  );

  const actions = [
    {
      onClick: handleExpandAll,
      type: 'submit',
      variant: 'tertiary',
      tradId: 'header.action.expandAll',
      margin: '8px',
    },
    {
      onClick: handleCollapseAll,
      type: 'submit',
      variant: 'tertiary',
      tradId: 'header.action.collapseAll',
      margin: '8px',
    },
  ] as Array<ToBeFixed>;

  if (canUpdate) {
    actions.push({
      onClick: handleNewNavigationItem as ToBeFixed,
      type: 'submit',
      variant: 'primary',
      tradId: 'header.action.newItem',
      startIcon: <Plus />,
      margin: '8px',
    });
  }

  return actions.map(({ tradId, margin, ...item }, i) => (
    <Box marginLeft={margin} key={i}>
      <Button {...item}> {formatMessage(getTrad(tradId))} </Button>
    </Box>
  ));
};
