import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { type ReactNode } from 'react';

import { mapServerNavigationItem } from '../../pages/HomePage/utils';
import { type NavigationSortableData } from '../../utils/dnd';

type Props = {
  children: ReactNode;
};

export const NavigationDndProvider = ({ children }: Props) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const activeData = active.data.current as NavigationSortableData | undefined;
    const overData = over.data.current as NavigationSortableData | undefined;

    if (!activeData || !overData) {
      return;
    }

    if (activeData.levelPath !== overData.levelPath) {
      return;
    }

    const activeOrder = activeData.item.order ?? 0;
    const overOrder = overData.item.order ?? 0;

    if (activeOrder === overOrder) {
      return;
    }

    const newOrder = activeOrder < overOrder ? overOrder + 0.5 : overOrder - 0.5;

    activeData.onItemReOrder({
      item: {
        ...mapServerNavigationItem(activeData.item, true),
        viewParentId: activeData.viewParentId ?? activeData.item.viewParentId,
      },
      newOrder,
    });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
};
