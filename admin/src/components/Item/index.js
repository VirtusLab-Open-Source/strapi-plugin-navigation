import PropTypes from 'prop-types';
import React from 'react';
import { isEmpty, isNumber } from 'lodash';
import { useIntl } from "react-intl";

import { Card, CardBody } from '@strapi/design-system/Card';
import { Divider } from '@strapi/design-system/Divider';
import { TextButton } from '@strapi/design-system/TextButton';
import { Typography } from '@strapi/design-system/Typography';
import PlusIcon from '@strapi/icons/Plus';
import EarthIcon from '@strapi/icons/Earth';
import LinkIcon from '@strapi/icons/Link';

import { navigationItemType } from '../../pages/View/utils/enums';
import ItemCardHeader from './ItemCardHeader';
import List from '../NavigationItemList';
import Wrapper from './Wrapper';
import { getTrad } from '../../translations';

const Item = (props) => {
  const {
    item,
    level = 0,
    levelPath = '',
    allowedLevels,
    relatedRef,
    isParentAttachedToMenu,
    onItemLevelAdd,
    onItemRemove,
    onItemRestore,
    onItemEdit,
    error,
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

  const { formatMessage } = useIntl();
  const isExternal = type === navigationItemType.EXTERNAL;
  const isPublished = relatedRef && relatedRef?.publishedAt;
  const isNextMenuAllowedLevel = isNumber(allowedLevels) ? level < (allowedLevels - 1) : true;
  const hasChildren = !isEmpty(item.items) && !isExternal;
  const absolutePath = isExternal ? undefined : `${levelPath === '/' ? '' : levelPath}/${path === '/' ? '' : path}`;

  return (
    <Wrapper level={level}>
      <Card style={{ width: "728px", zIndex: 1, position: "relative" }}>
        <CardBody>
          <ItemCardHeader
            title={title}
            path={isExternal ? externalPath : absolutePath}
            icon={isExternal ? <EarthIcon /> : <LinkIcon />}
            isPublished={isPublished}
            onItemRemove={() => onItemRemove(item)}
            onItemEdit={() => onItemEdit(item, levelPath, isParentAttachedToMenu)}
            onItemRestore={() => onItemRestore(item)}
            removed={removed}
          />
        </CardBody>
        <Divider />
        <CardBody style={{ margin: '8px' }}>
          <TextButton
            disabled={removed}
            startIcon={<PlusIcon />}
            onClick={(e) => onItemLevelAdd(e, viewId, isNextMenuAllowedLevel, absolutePath, menuAttached)}
          >
            <Typography variant="pi" fontWeight="bold" textColor={removed ? "neutral600" : "primary600"}>
              {formatMessage(getTrad("navigation.item.action.newItem"))}
            </Typography>
          </TextButton>
        </CardBody>
      </Card>
      {hasChildren && !removed && <List
        onItemLevelAdd={onItemLevelAdd}
        onItemRemove={onItemRemove}
        onItemEdit={onItemEdit}
        onItemRestore={onItemRestore}
        error={error}
        allowedLevels={allowedLevels}
        isParentAttachedToMenu={true}
        items={item.items}
        level={level + 1}
        levelPath={absolutePath}
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
    audience: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
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
};

export default Item;