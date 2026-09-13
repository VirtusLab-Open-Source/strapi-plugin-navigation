import {
  KeyboardCode,
  closestCenter,
  type ClientRect,
  type Collision,
  type CollisionDetection,
  type DroppableContainer,
  type KeyboardCoordinateGetter,
  type UniqueIdentifier,
} from '@dnd-kit/core';

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

export const getNavigationItemSortableId = (
  item: NavigationItemSchema,
  structureId: string
): string => {
  return item.viewId != null ? String(item.viewId) : structureId;
};

const getSortableContainerId = (data: { current?: unknown } | null | undefined) => {
  const current = data?.current as
    | { sortable?: { containerId?: UniqueIdentifier }; levelPath?: string }
    | undefined;
  return current?.sortable?.containerId;
};

const getSortableIndex = (data: { current?: unknown } | null | undefined) => {
  const current = data?.current as { sortable?: { index?: number } } | undefined;
  return current?.sortable?.index;
};

const getLevelPath = (data: { current?: unknown } | null | undefined) => {
  const current = data?.current as NavigationSortableData | undefined;
  return current?.levelPath;
};

const isSameLevelAsActive = (
  container: DroppableContainer,
  activeContainerId: UniqueIdentifier | undefined,
  activeLevelPath: string | undefined
) => {
  const containerId = getSortableContainerId(container.data);
  if (activeContainerId != null && containerId != null) {
    return containerId === activeContainerId;
  }

  return getLevelPath(container.data) === activeLevelPath;
};

const centerOfRect = (rect: ClientRect) => ({
  x: rect.left + rect.width * 0.5,
  y: rect.top + rect.height * 0.5,
});

const distanceBetween = (
  a: { x: number; y: number },
  b: { x: number; y: number }
) => Math.hypot(a.x - b.x, a.y - b.y);

const KEYBOARD_DIRECTIONS: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Up,
  KeyboardCode.Left,
  KeyboardCode.Right,
];

type KeyboardNavigationState = {
  getIndex: () => number | null;
  setIndex: (index: number) => void;
  setTargetId: (id: UniqueIdentifier | null) => void;
  getTargetId: () => UniqueIdentifier | null;
  getInitialCoordinates: () => { x: number; y: number } | null;
  setInitialCoordinates: (coords: { x: number; y: number }) => void;
  markMoved: () => void;
};

export const navigationCollisionDetection: CollisionDetection = (args) => {
  const activeContainerId = getSortableContainerId(args.active.data);
  const activeLevelPath = getLevelPath(args.active.data);

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
  state: KeyboardNavigationState
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

    if (!state.getInitialCoordinates()) {
      state.setInitialCoordinates({ x: collisionRect.left, y: collisionRect.top });
    }

    const activeContainerId = getSortableContainerId(active.data);
    const activeIndex = getSortableIndex(active.data) ?? 0;

    const items = droppableContainers
      .getEnabled()
      .filter((entry): entry is DroppableContainer => !!entry && !entry.disabled)
      .filter((entry) => getSortableContainerId(entry.data) === activeContainerId)
      .sort((a, b) => (getSortableIndex(a.data) ?? 0) - (getSortableIndex(b.data) ?? 0));

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
      state.setTargetId(null);
      return state.getInitialCoordinates() ?? undefined;
    }

    const target = items.find((entry) => (getSortableIndex(entry.data) ?? -1) === nextIndex);
    if (!target) {
      return;
    }

    const rect = droppableRects.get(target.id);
    if (!rect) {
      return;
    }

    state.setTargetId(target.id);

    const isAfterActive = nextIndex > activeIndex;

    return {
      x: rect.left,
      y: isAfterActive ? rect.bottom - collisionRect.height : rect.top,
    };
  };
};

export const createNavigationCollisionDetection = (
  getKeyboardTargetId: () => UniqueIdentifier | null,
  hasDragMoved: () => boolean,
  isKeyboardHome: () => boolean
): CollisionDetection => {
  return (args) => {
    if (!hasDragMoved()) {
      return [];
    }

    if (isKeyboardHome()) {
      return [{ id: args.active.id }];
    }

    const keyboardTargetId = getKeyboardTargetId();
    if (keyboardTargetId != null) {
      const exists = args.droppableContainers.some(
        (container) => container.id === keyboardTargetId
      );
      if (exists) {
        return [{ id: keyboardTargetId }];
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
