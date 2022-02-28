import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { drop, isEmpty, isNumber } from 'lodash';

import { Box } from '@strapi/design-system/Box';
import { Card, CardBody } from '@strapi/design-system/Card';
import { Divider } from '@strapi/design-system/Divider';
import { Flex } from '@strapi/design-system/Flex';
import { Link } from '@strapi/design-system/Link';
import { TextButton } from '@strapi/design-system/TextButton';
import { Typography } from '@strapi/design-system/Typography';
import { ArrowRight, Link as LinkIcon, Earth, Plus } from '@strapi/icons';

import { navigationItemType } from '../../pages/View/utils/enums';
import ItemCardHeader from './ItemCardHeader';
import List from '../NavigationItemList';
import Wrapper from './Wrapper';
import { extractRelatedItemLabel } from '../../pages/View/utils/parsers';
import ItemCardBadge from './ItemCardBadge';
import { ItemCardRemovedOverlay } from './ItemCardRemovedOverlay';
import { getMessage, ItemTypes } from '../../utils';

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
  } = item;

  const { contentTypes, contentTypesNameFields } = config;
  const isExternal = type === navigationItemType.EXTERNAL;
  const isPublished = relatedRef && relatedRef?.publishedAt;
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

      onItemReOrder({ ...hoveringItem }, newOrder);
    },
    collect: monitor => ({
      isOverCurrent: monitor.isOver({ shallow: true }),
    })
  });

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: `${ItemTypes.NAVIGATION_ITEM}_${levelPath}`,
    item: () => {
      return { ...item };
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

  return (
    <Wrapper level={level} isLast={isLast} style={{ opacity: isDragging ? 0.2 : 1 }} ref={refs ? refs.dropRef : null} >
      <Card style={{ width: "728px", zIndex: 1, position: "relative", overflow: 'hidden' }}>
        {removed && (<ItemCardRemovedOverlay />)}
        <div ref={refs.previewRef}>
          <CardBody>
            <ItemCardHeader
              title={title}
              path={isExternal ? externalPath : absolutePath}
              icon={isExternal ? Earth : LinkIcon}
              onItemRemove={() => onItemRemove({
                ...item,
                relatedRef,
              })}
              onItemEdit={() => onItemEdit({
                ...item,
                isMenuAllowedLevel,
                isParentAttachedToMenu,
              }, levelPath, isParentAttachedToMenu)}
              onItemRestore={() => onItemRestore({
                ...item,
                relatedRef,
              })}
              dragRef={refs.dragRef}
              removed={removed}
            />
          </CardBody>
          <Divider />
          {!isExternal && (<CardBody style={{ margin: '8px' }}>
            <Flex style={{ width: '100%' }} direction="row" alignItems="center" justifyContent="space-between">
              <TextButton
                disabled={removed}
                startIcon={<Plus />}
                onClick={(e) => onItemLevelAdd(e, viewId, isNextMenuAllowedLevel, absolutePath, menuAttached)}
              >
                <Typography variant="pi" fontWeight="bold" textColor={removed ? "neutral600" : "primary600"}>
                  {getMessage("components.navigationItem.action.newItem")}
                </Typography>
              </TextButton>
              {relatedItemLabel && (<Box>
                <ItemCardBadge
                  borderColor={`${relatedBadgeColor}200`}
                  backgroundColor={`${relatedBadgeColor}100`}
                  textColor={`${relatedBadgeColor}600`}
                  className="action"
                  small
                >
                  {getMessage({
                    id: `components.navigationItem.badge.${isPublished ? 'published' : 'draft'}`, props: {
                      type: relatedTypeLabel
                    }
                  })}
                </ItemCardBadge>
                <Typography variant="pi" fontWeight="bold" textColor="neutral600">
                  {relatedItemLabel}
                  <Link
                    to={`/content-manager/collectionType/${relatedRef?.__collectionUid}/${relatedRef?.id}`}
                    endIcon={<ArrowRight />}>&nbsp;</Link>
                </Typography>
              </Box>)
              }
            </Flex>
          </CardBody>)}
        </div>
      </Card>
      {hasChildren && !removed && <List
        onItemLevelAdd={onItemLevelAdd}
        onItemRemove={onItemRemove}
        onItemEdit={onItemEdit}
        onItemRestore={onItemRestore}
        onItemReOrder={onItemReOrder}
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
    menuAttached: PropTypes.bool
  }).isRequired,
  relatedRef: PropTypes.object,
  level: PropTypes.number,
  levelPath: PropTypes.string,
  isParentAttachedToMenu: PropTypes.bool,
  onItemRestore: PropTypes.func.isRequired,
  onItemLevelAdd: PropTypes.func.isRequired,
  onItemRemove: PropTypes.func.isRequired,
  onItemReOrder: PropTypes.func.isRequired,
  config: PropTypes.shape({
    contentTypes: PropTypes.array.isRequired,
    contentTypesNameFields: PropTypes.object.isRequired,
  }).isRequired
};

export default Item;