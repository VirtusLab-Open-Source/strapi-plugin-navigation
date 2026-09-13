import {
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { type ReactNode, useRef } from 'react';

import { mapServerNavigationItem } from '../../pages/HomePage/utils';
import {
  NAVIGATION_DND_ACTIVATION_DISTANCE_PX,
  createNavigationCollisionDetection,
  createNavigationSortableKeyboardCoordinates,
  getNavigationReorderOrder,
  type NavigationSortableData,
} from '../../utils/dnd';

type Props = {
  children: ReactNode;
};

export const NavigationDndProvider = ({ children }: Props) => {
  const lastOverRef = useRef<DragOverEvent['over']>(null);
  const hasDragMovedRef = useRef(false);
  const keyboardTargetIdRef = useRef<UniqueIdentifier | null>(null);
  const keyboardIndexRef = useRef<number | null>(null);
  const keyboardHomeIndexRef = useRef<number | null>(null);
  const initialCoordinatesRef = useRef<{ x: number; y: number } | null>(null);

  const keyboardCoordinateGetter = createNavigationSortableKeyboardCoordinates({
    getIndex: () => keyboardIndexRef.current,
    setIndex: (index) => {
      keyboardIndexRef.current = index;
    },
    setTargetId: (id) => {
      keyboardTargetIdRef.current = id;
    },
    getTargetId: () => keyboardTargetIdRef.current,
    getInitialCoordinates: () => initialCoordinatesRef.current,
    setInitialCoordinates: (coords) => {
      initialCoordinatesRef.current = coords;
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
    () => keyboardTargetIdRef.current,
    () => hasDragMovedRef.current,
    () =>
      keyboardIndexRef.current != null &&
      keyboardHomeIndexRef.current != null &&
      keyboardIndexRef.current === keyboardHomeIndexRef.current
  );

  const clearDragState = () => {
    lastOverRef.current = null;
    hasDragMovedRef.current = false;
    keyboardTargetIdRef.current = null;
    keyboardIndexRef.current = null;
    keyboardHomeIndexRef.current = null;
    initialCoordinatesRef.current = null;
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    clearDragState();
    const homeIndex = (
      active.data.current as { sortable?: { index?: number } } | undefined
    )?.sortable?.index;
    keyboardHomeIndexRef.current = homeIndex ?? null;
    keyboardIndexRef.current = homeIndex ?? null;
  };

  const handleDragMove = ({ delta, activatorEvent }: DragMoveEvent) => {
    if (activatorEvent && !('code' in activatorEvent)) {
      keyboardTargetIdRef.current = null;
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

    const activeData = active.data.current as NavigationSortableData | undefined;
    const overData = over.data.current as NavigationSortableData | undefined;

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

    const activeData = active.data.current as NavigationSortableData | undefined;
    const overData = dropTarget.data.current as NavigationSortableData | undefined;

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
