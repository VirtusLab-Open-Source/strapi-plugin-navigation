import {
  KeyboardCode,
  closestCenter,
  type Active,
  type ClientRect,
  type Collision,
  type CollisionDetection,
  type DroppableContainer,
  type KeyboardCoordinateGetter,
  type Over,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { hasSortableData } from '@dnd-kit/sortable';

import { type NavigationItemSchema } from '../api/validators';
import { type NavigationItemFormSchema } from '../pages/HomePage/components/NavigationItemForm';

export const NAVIGATION_DND_ACTIVATION_DISTANCE_PX = 5;

export const NAVIGATION_DND_ORDER_OFFSET = 0.5;

export type NavigationItemReorderPayload = {
  item: NavigationItemFormSchema;
  newOrder: number;
};

export type NavigationSortableData = {
  levelPath: string;
  item: NavigationItemSchema;
  viewParentId?: number;
  onItemReOrder: (payload: NavigationItemReorderPayload) => void;
};

export const isNavigationSortableData = (data: unknown): data is NavigationSortableData => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  return (
    'levelPath' in data &&
    'item' in data &&
    'onItemReOrder' in data &&
    typeof (data as NavigationSortableData).onItemReOrder === 'function'
  );
};

export const getNavigationSortableData = (
  entity: { data: { current?: unknown } } | null | undefined
): NavigationSortableData | undefined => {
  const current = entity?.data.current;
  return isNavigationSortableData(current) ? current : undefined;
};

export const getNavigationItemSortableId = (
  item: NavigationItemSchema,
  structureId: string
): string => {
  return item.viewId != null ? String(item.viewId) : structureId;
};

const getSortableContainerId = (
  entity: Active | Over | DroppableContainer | { data: { current?: unknown } } | null | undefined
) => {
  if (hasSortableData(entity)) {
    return entity.data.current.sortable.containerId;
  }

  return undefined;
};

const getSortableIndex = (
  entity: Active | Over | DroppableContainer | { data: { current?: unknown } } | null | undefined
) => {
  if (hasSortableData(entity)) {
    return entity.data.current.sortable.index;
  }

  return undefined;
};

const getLevelPath = (
  entity: Active | Over | DroppableContainer | { data: { current?: unknown } } | null | undefined
) => getNavigationSortableData(entity)?.levelPath;

const isSameLevelAsActive = (
  container: DroppableContainer,
  activeContainerId: UniqueIdentifier | undefined,
  activeLevelPath: string | undefined
) => {
  const containerId = getSortableContainerId(container);
  if (activeContainerId != null && containerId != null) {
    return containerId === activeContainerId;
  }

  return getLevelPath(container) === activeLevelPath;
};

const centerOfRect = (rect: ClientRect) => ({
  x: rect.left + rect.width * 0.5,
  y: rect.top + rect.height * 0.5,
});

const distanceBetween = (
  a: { x: number; y: number },
  b: { x: number; y: number }
) => Math.hypot(a.x - b.x, a.y - b.y);

const getSameLevelItems = (
  droppableContainers: {
    getEnabled: () => (DroppableContainer | undefined)[];
  },
  activeContainerId: UniqueIdentifier | undefined
) =>
  droppableContainers
    .getEnabled()
    .filter((entry): entry is DroppableContainer => !!entry && !entry.disabled)
    .filter((entry) => getSortableContainerId(entry) === activeContainerId)
    .sort((a, b) => (getSortableIndex(a) ?? 0) - (getSortableIndex(b) ?? 0));

const KEYBOARD_DIRECTIONS: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Up,
  KeyboardCode.Left,
  KeyboardCode.Right,
];

type KeyboardIndexState = {
  getIndex: () => number | null;
  setIndex: (index: number | null) => void;
  markMoved: () => void;
};

export const navigationCollisionDetection: CollisionDetection = (args) => {
  const activeContainerId = getSortableContainerId(args.active);
  const activeLevelPath = getLevelPath(args.active);

  const sameLevelDroppables = args.droppableContainers.filter((container) => {
    if (container.id === args.active.id) {
      return false;
    }

    return isSameLevelAsActive(container, activeContainerId, activeLevelPath);
  });

  const siblingCollisions = closestCenter({
    ...args,
    droppableContainers: sameLevelDroppables,
  });

  const initialRect = args.active.rect.current.initial;
  if (!initialRect || !args.collisionRect) {
    return siblingCollisions;
  }

  const homeDistance = distanceBetween(
    centerOfRect(args.collisionRect),
    centerOfRect(initialRect)
  );
  const bestSiblingDistance = siblingCollisions[0]?.data?.value;
  const bestDistance =
    typeof bestSiblingDistance === 'number' ? bestSiblingDistance : Number.POSITIVE_INFINITY;

  if (homeDistance <= bestDistance) {
    const homeCollision: Collision = {
      id: args.active.id,
      data: { value: homeDistance },
    };
    return [homeCollision];
  }

  return siblingCollisions;
};

export const createNavigationSortableKeyboardCoordinates = (
  state: KeyboardIndexState
): KeyboardCoordinateGetter => {
  return (event, { context }) => {
    if (!KEYBOARD_DIRECTIONS.includes(event.code)) {
      return;
    }

    event.preventDefault();

    const { active, droppableContainers, droppableRects, collisionRect } = context;
    if (!active || !collisionRect) {
      return;
    }

    const activeContainerId = getSortableContainerId(active);
    const activeIndex = getSortableIndex(active) ?? 0;
    const items = getSameLevelItems(droppableContainers, activeContainerId);

    if (items.length === 0) {
      return;
    }

    const maxIndex = items.length - 1;
    const currentIndex = state.getIndex() ?? activeIndex;
    const moveDown = event.code === KeyboardCode.Down || event.code === KeyboardCode.Right;
    const nextIndex = moveDown
      ? Math.min(currentIndex + 1, maxIndex)
      : Math.max(currentIndex - 1, 0);

    if (nextIndex === currentIndex) {
      return;
    }

    state.setIndex(nextIndex);
    state.markMoved();

    if (nextIndex === activeIndex) {
      const initial = active.rect.current.initial;
      if (!initial) {
        return;
      }
      return { x: initial.left, y: initial.top };
    }

    const target = items.find((entry) => (getSortableIndex(entry) ?? -1) === nextIndex);
    const rect = target ? droppableRects.get(target.id) : undefined;
    if (!target || !rect) {
      return;
    }

    return {
      x: rect.left,
      y: nextIndex > activeIndex ? rect.bottom - collisionRect.height : rect.top,
    };
  };
};

export const createNavigationCollisionDetection = (
  getKeyboardIndex: () => number | null,
  hasDragMoved: () => boolean
): CollisionDetection => {
  return (args) => {
    if (!hasDragMoved()) {
      return [];
    }

    const keyboardIndex = getKeyboardIndex();
    const activeIndex = getSortableIndex(args.active);

    if (keyboardIndex != null && activeIndex != null) {
      if (keyboardIndex === activeIndex) {
        return [{ id: args.active.id }];
      }

      const activeContainerId = getSortableContainerId(args.active);
      const target = getSameLevelItems(args.droppableContainers, activeContainerId).find(
        (entry) => entry.id !== args.active.id && (getSortableIndex(entry) ?? -1) === keyboardIndex
      );

      if (target) {
        return [{ id: target.id }];
      }
    }

    return navigationCollisionDetection(args);
  };
};

export const getNavigationReorderOrder = (activeOrder: number, overOrder: number): number => {
  if (activeOrder === overOrder) {
    return activeOrder;
  }

  return activeOrder < overOrder
    ? overOrder + NAVIGATION_DND_ORDER_OFFSET
    : overOrder - NAVIGATION_DND_ORDER_OFFSET;
};
