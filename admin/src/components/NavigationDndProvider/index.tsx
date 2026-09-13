import {
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { hasSortableData } from '@dnd-kit/sortable';
import { type ReactNode, useRef } from 'react';

import { mapServerNavigationItem } from '../../pages/HomePage/utils';
import {
  NAVIGATION_DND_ACTIVATION_DISTANCE_PX,
  createNavigationCollisionDetection,
  createNavigationSortableKeyboardCoordinates,
  getNavigationReorderOrder,
  getNavigationSortableData,
} from '../../utils/dnd';

type Props = {
  children: ReactNode;
};

export const NavigationDndProvider = ({ children }: Props) => {
  const lastOverRef = useRef<DragOverEvent['over']>(null);
  const hasDragMovedRef = useRef(false);
  const keyboardIndexRef = useRef<number | null>(null);

  const keyboardCoordinateGetter = createNavigationSortableKeyboardCoordinates({
    getIndex: () => keyboardIndexRef.current,
    setIndex: (index) => {
      keyboardIndexRef.current = index;
    },
    markMoved: () => {
      hasDragMovedRef.current = true;
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: NAVIGATION_DND_ACTIVATION_DISTANCE_PX,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: keyboardCoordinateGetter,
      scrollBehavior: 'auto',
    })
  );

  const collisionDetection = createNavigationCollisionDetection(
    () => keyboardIndexRef.current,
    () => hasDragMovedRef.current
  );

  const clearDragState = () => {
    lastOverRef.current = null;
    hasDragMovedRef.current = false;
    keyboardIndexRef.current = null;
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    clearDragState();
    keyboardIndexRef.current = hasSortableData(active)
      ? active.data.current.sortable.index
      : null;
  };

  const handleDragMove = ({ delta, activatorEvent }: DragMoveEvent) => {
    if (activatorEvent && !('code' in activatorEvent)) {
      keyboardIndexRef.current = null;
    }

    if (delta.x !== 0 || delta.y !== 0) {
      hasDragMovedRef.current = true;
    }
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || !hasDragMovedRef.current) {
      return;
    }

    if (over.id === active.id) {
      lastOverRef.current = null;
      return;
    }

    const activeData = getNavigationSortableData(active);
    const overData = getNavigationSortableData(over);

    if (activeData && overData && activeData.levelPath === overData.levelPath) {
      lastOverRef.current = over;
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const dropTarget = over?.id === active.id ? null : (over ?? lastOverRef.current);
    clearDragState();

    if (!dropTarget || active.id === dropTarget.id) {
      return;
    }

    const activeData = getNavigationSortableData(active);
    const overData = getNavigationSortableData(dropTarget);

    if (!activeData || !overData) {
      return;
    }

    if (activeData.levelPath !== overData.levelPath) {
      return;
    }

    const activeOrder = activeData.item.order ?? 0;
    const overOrder = overData.item.order ?? 0;
    const newOrder = getNavigationReorderOrder(activeOrder, overOrder);

    if (newOrder === activeOrder) {
      return;
    }

    activeData.onItemReOrder({
      item: {
        ...mapServerNavigationItem(activeData.item, true),
        viewParentId: activeData.viewParentId ?? activeData.item.viewParentId,
      },
      newOrder,
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={clearDragState}
    >
      {children}
    </DndContext>
  );
};
