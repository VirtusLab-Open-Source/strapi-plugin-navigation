import React from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { isEmpty, isNumber } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@buffetjs/core';
import CardWrapper from './CardWrapper';
import CardItem from './CardItem';
import ItemFooter from '../ItemFooter';
import { navigationItemType } from '../../containers/View/utils/enums';
import CardItemPath from './CardItemPath';
import CardItemTitle from './CardItemTitle';
import CardItemLevelAdd from './CardItemLevelAdd';
import List from '../List';
import CardItemLevelWrapper from './CardItemLevelWrapper';
import CardItemRestore from './CardItemRestore';
import pluginId from '../../pluginId';
import ItemOrdering from '../ItemOrdering';

const Item = (props) => {
  const {
    item,
    level = 0,
    levelPath = '',
    allowedLevels,
    contentTypesNameFields,
    relatedRef,
    isFirst = false,
    isLast = false,
    onItemClick,
    onItemReOrder,
    onItemRestoreClick,
    onItemLevelAddClick,
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
  const footerProps = {
    type: type || navigationItemType.INTERNAL,
    removed,
    menuAttached,
    relatedRef,
    contentTypesNameFields,
    attachButtons: !(isFirst && isLast),
  };

  const { formatMessage } = useIntl();

  const isNextMenuAllowedLevel = isNumber(allowedLevels) ? level < (allowedLevels - 1) : true;
  const isMenuAllowedLevel = isNumber(allowedLevels) ? level < allowedLevels : true;
  const isExternal = item.type === navigationItemType.EXTERNAL;
  const absolutePath = isExternal ? undefined : `${levelPath === '/' ? '' : levelPath}/${path === '/' ? '' : path}`;
  const hasChildren = !isEmpty(item.items) && !isExternal;

  const handleReOrder = (e, moveBy = 0) => onItemReOrder(e, {
    ...item,
    relatedRef,
  }, moveBy);

  const hasError = error?.parentId === item.parent && error?.errorTitles.includes(item.title);
  return (
    <CardWrapper
      level={level}
      error={hasError}
    >
      <CardItem
        hasChildren={hasChildren}
        removed={removed}
        hasError={hasError}
        onClick={(e) =>
          removed ? null : onItemClick(e, {
            ...item,
            isMenuAllowedLevel,
          }, levelPath)
        }
      >
        {removed && (<CardItemRestore>
          <Button
            onClick={e => onItemRestoreClick(e, item)}
            color="secondary"
            label={formatMessage({
              id: `${pluginId}.popup.item.form.button.restore`,
            })}
          />
        </CardItemRestore>)}
        <CardItemTitle>{title}</CardItemTitle>
        <CardItemPath>
          {isExternal ? externalPath : absolutePath}
        </CardItemPath>
        <ItemFooter {...footerProps} />
        <ItemOrdering
          isFirst={isFirst}
          isLast={isLast}
          onChangeOrder={handleReOrder}
        />
      </CardItem>
      {!(isExternal || removed) && (
        <CardItemLevelAdd
          color={isNextMenuAllowedLevel ? 'primary' : 'secondary'}
          icon={<FontAwesomeIcon icon={faPlus} size="3x" />}
          onClick={(e) => onItemLevelAddClick(e, viewId, isNextMenuAllowedLevel, levelPath)}
          menuLevel={isNextMenuAllowedLevel}
        />
      )}
      {hasChildren && !removed && (
        <List
          items={item.items}
          onItemClick={onItemClick}
          onItemReOrder={onItemReOrder}
          onItemRestoreClick={onItemRestoreClick}
          onItemLevelAddClick={onItemLevelAddClick}
          as={CardItemLevelWrapper}
          level={level + 1}
          levelPath={absolutePath}
          allowedLevels={allowedLevels}
          contentTypesNameFields={contentTypesNameFields}
          error={error}
        />
      )}
    </CardWrapper>
  );
};

Item.propTypes = {
  item: PropTypes.objectOf({
    title: PropTypes.string,
    type: PropTypes.string,
    uiRouterKey: PropTypes.string,
    path: PropTypes.string,
    externalPath: PropTypes.string,
    audience: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    related: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    menuAttached: PropTypes.bool,
  }).isRequired,
  relatedRef: PropTypes.object,
  contentTypesNameFields: PropTypes.object.isRequired,
  level: PropTypes.number,
  levelPath: PropTypes.string,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
  onItemClick: PropTypes.func.isRequired,
  onItemRestoreClick: PropTypes.func.isRequired,
  onItemLevelAddClick: PropTypes.func.isRequired,
};

export default Item;
