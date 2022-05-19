import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import { isEmpty, isNumber } from 'lodash';

import { Card, CardBody } from '@strapi/design-system/Card';
import { Divider } from '@strapi/design-system/Divider';
import { Flex } from '@strapi/design-system/Flex';
import { Link } from '@strapi/design-system/Link';
import { TextButton } from '@strapi/design-system/TextButton';
import { Typography } from '@strapi/design-system/Typography';
import { ArrowRight, Link as LinkIcon, Earth, Plus, Cog } from '@strapi/icons';

import { navigationItemType } from '../../pages/View/utils/enums';
import ItemCardHeader from './ItemCardHeader';
import List from '../NavigationItemList';
import Wrapper from './Wrapper';
import { extractRelatedItemLabel } from '../../pages/View/utils/parsers';
import ItemCardBadge from './ItemCardBadge';
import { ItemCardRemovedOverlay } from './ItemCardRemovedOverlay';
import { getMessage, ItemTypes } from '../../utils';
import CollapseButton from '../CollapseButton';

const Item = (props) => {
  const {
    item,
    isLast = false,
    level = 0,
    levelPath = '',
    allowedLevels,
    relatedRef,
    isParentAttachedToMenu,
    onItemLevelAdd,
    onItemRemove,
    onItemRestore,
    onItemEdit,
    onItemReOrder,
    onItemToggleCollapse,
    error,
    displayChildren,
    config = {},
  } = props;

  const {
    viewId,
    title,
    type,
    path,
    removed,
    externalPath,
    menuAttached,
    collapsed,
    structureId,
    items = [],
  } = item;

  const { contentTypes, contentTypesNameFields } = config;
  const isExternal = type === navigationItemType.EXTERNAL;
  const isWrapper = type === navigationItemType.WRAPPER;
  const isHandledByPublishFlow = contentTypes.find(_ => _.uid === relatedRef?.__collectionUid)?.draftAndPublish;
  const isPublished = isHandledByPublishFlow && relatedRef.publishedAt;
  const isNextMenuAllowedLevel = isNumber(allowedLevels) ? level < (allowedLevels - 1) : true;
  const isMenuAllowedLevel = isNumber(allowedLevels) ? level < allowedLevels : true;
  const hasChildren = !isEmpty(item.items) && !isExternal && !displayChildren;
  const absolutePath = isExternal ? undefined : `${levelPath === '/' ? '' : levelPath}/${path === '/' ? '' : path}`;

  const relatedItemLabel = !isExternal ? extractRelatedItemLabel(relatedRef, contentTypesNameFields, { contentTypes }) : '';
  const relatedTypeLabel = relatedRef?.labelSingular;
  const relatedBadgeColor = isPublished ? 'success' : 'secondary';

  const dragRef = useRef(null);
  const dropRef = useRef(null);
  const previewRef = useRef(null);

  const [, drop] = useDrop({
    accept: `${ItemTypes.NAVIGATION_ITEM}_${levelPath}`,
    hover(hoveringItem, monitor) {
      const dragIndex = hoveringItem.order;
      const dropIndex = item.order;

      // Don't replace items with themselves
      if (dragIndex === dropIndex) {
        return;
      }

      const hoverBoundingRect = dropRef.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Place the hovering item before or after the drop target
      const isAfter = hoverClientY > hoverMiddleY;
      const newOrder = isAfter ? item.order + 0.5 : item.order - 0.5;

      if (dragIndex < dropIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > dropIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onItemReOrder({ ...hoveringItem }, newOrder);
      hoveringItem.order = newOrder;
    },
    collect: monitor => ({
      isOverCurrent: monitor.isOver({ shallow: true }),
    })
  });

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: `${ItemTypes.NAVIGATION_ITEM}_${levelPath}`,
    item: () => {
      return item;
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const refs = {
    dragRef: drag(dragRef),
    dropRef: drop(dropRef),
    previewRef: dragPreview(previewRef),
  }

  const contentTypeUid = relatedRef?.__collectionUid;
  const contentType = contentTypes.find(_ => _.uid === contentTypeUid) || {};
  const generatePreviewUrl = entity => {
    const { isSingle } = contentType;
    return `/content-manager/${ isSingle ? 'singleType' : 'collectionType'}/${entity?.__collectionUid}${!isSingle ? '/' + entity?.id : ''}`
  }
  const onNewItemClick = useCallback((event) => onItemLevelAdd(
    event,
    viewId,
    isNextMenuAllowedLevel,
    absolutePath,
    menuAttached,
    `${structureId}.${items.length}`,
  ), [viewId, isNextMenuAllowedLevel, absolutePath, menuAttached, structureId, items]);

  return (
    <Wrapper level={level} isLast={isLast} style={{ opacity: isDragging ? 0.2 : 1 }} ref={refs ? refs.dropRef : null} >
      <Card style={{ width: "728px", zIndex: 1, position: "relative", overflow: 'hidden' }}>
        {removed && (<ItemCardRemovedOverlay />)}
        <div ref={refs.previewRef}>
          <CardBody>
            <ItemCardHeader
              title={title}
              path={isExternal ? externalPath : absolutePath}
              icon={isExternal ? Earth : isWrapper ? Cog : LinkIcon}
              onItemRemove={() => onItemRemove(item)}
              onItemEdit={() => onItemEdit({
                ...item,
                isMenuAllowedLevel,
                isParentAttachedToMenu,
              }, levelPath, isParentAttachedToMenu)}
              onItemRestore={() => onItemRestore(item)}
              dragRef={refs.dragRef}
              removed={removed}
            />
          </CardBody>
          <Divider />
          {!isExternal && (
            <CardBody style={{ padding: '8px' }}>
              <Flex style={{ width: '100%' }} direction="row" alignItems="center" justifyContent="space-between">
                <Flex>
                  {!isEmpty(item.items) && <CollapseButton toggle={() => onItemToggleCollapse(item)} collapsed={collapsed} itemsCount={item.items.length}/>}
                  <TextButton
                    disabled={removed}
                    startIcon={<Plus />}
                    onClick={onNewItemClick}
                  >
                    <Typography variant="pi" fontWeight="bold" textColor={removed ? "neutral600" : "primary600"}>
                      {getMessage("components.navigationItem.action.newItem")}
                    </Typography>
                  </TextButton>
                </Flex>
                {relatedItemLabel && (
                  <Flex justifyContent='center' alignItems='center'>
                    {isHandledByPublishFlow && (<ItemCardBadge
                      borderColor={`${relatedBadgeColor}200`}
                      backgroundColor={`${relatedBadgeColor}100`}
                      textColor={`${relatedBadgeColor}600`}
                      className="action"
                      small
                    >
                      {getMessage({id: `components.navigationItem.badge.${isPublished ? 'published' : 'draft'}`})}
                    </ItemCardBadge>)}
                    <Typography variant="omega" textColor='neutral600'>{relatedTypeLabel}&nbsp;/&nbsp;</Typography>
                    <Typography variant="omega" textColor='neutral800'>{relatedItemLabel}</Typography>
                      <Link
                        to={`/content-manager/collectionType/${relatedRef?.__collectionUid}/${relatedRef?.id}`}
                        endIcon={<ArrowRight />}>&nbsp;</Link>
                  </Flex>)
                }
              </Flex>
            </CardBody>)}
        </div>
      </Card>
      {hasChildren && !removed && !collapsed && <List
        onItemLevelAdd={onItemLevelAdd}
        onItemRemove={onItemRemove}
        onItemEdit={onItemEdit}
        onItemRestore={onItemRestore}
        onItemReOrder={onItemReOrder}
        onItemToggleCollapse={onItemToggleCollapse}
        error={error}
        allowedLevels={allowedLevels}
        isParentAttachedToMenu={menuAttached}
        items={item.items}
        level={level + 1}
        levelPath={absolutePath}
        contentTypes={contentTypes}
        contentTypesNameFields={contentTypesNameFields}
      />
      }
    </Wrapper>

  );
};

Item.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string,
    type: PropTypes.string,
    uiRouterKey: PropTypes.string,
    path: PropTypes.string,
    externalPath: PropTypes.string,
    related: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    menuAttached: PropTypes.bool,
    collapsed: PropTypes.bool,
  }).isRequired,
  relatedRef: PropTypes.object,
  level: PropTypes.number,
  levelPath: PropTypes.string,
  isParentAttachedToMenu: PropTypes.bool,
  onItemRestore: PropTypes.func.isRequired,
  onItemLevelAdd: PropTypes.func.isRequired,
  onItemRemove: PropTypes.func.isRequired,
  onItemReOrder: PropTypes.func.isRequired,
  onItemToggleCollapse: PropTypes.func.isRequired,
  config: PropTypes.shape({
    contentTypes: PropTypes.array.isRequired,
    contentTypesNameFields: PropTypes.object.isRequired,
  }).isRequired
};

export default Item;