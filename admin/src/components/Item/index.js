import React from 'react';
import PropTypes from 'prop-types';
import { isNumber } from 'lodash';

import { Card, CardBody } from '@strapi/design-system/Card';
import { Divider } from '@strapi/design-system/Divider';
import { TextButton } from '@strapi/design-system/TextButton';
import { Typography } from '@strapi/design-system/Typography';
import PlusIcon from '@strapi/icons/Plus';
import EarthIcon from '@strapi/icons/Earth';

import { navigationItemType } from '../../pages/View/utils/enums';
import ItemCardHeader from './ItemCardHeader';

const Item = (props) => {
  const {
		item,
    level = 0,
    levelPath = '',
    allowedLevels,
    contentTypesNameFields,
    contentTypes,
    relatedRef,
    isFirst = false,
    isLast = false,
    isParentAttachedToMenu,
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
    relatedType,
    removed,
    externalPath,
    menuAttached,
	} = item;

  const isExternal = type === navigationItemType.EXTERNAL;
  const isPublished = relatedRef && relatedRef?.publishedAt;
  const isNextMenuAllowedLevel = isNumber(allowedLevels) ? level < (allowedLevels - 1) : true;

	return (
		<Card style={{ width: "728px" }}>
			<CardBody>
        <ItemCardHeader
          title={title}
          path={path}
          icon={isExternal ? <LinkIcon /> : <EarthIcon />}
          isPublished={isPublished} />
			</CardBody>
			<Divider />
			<CardBody style={{ margin: '8px'}}>
        <TextButton
          startIcon={<PlusIcon />}
          onClick={(e) => onItemLevelAddClick(e, viewId, isNextMenuAllowedLevel, levelPath, menuAttached)}
        >
          <Typography variant="pi" fontWeight="bold" textColor="primary600">
            {/* TODO: This should be from translations */}
						Add nested item
					</Typography>
				</TextButton>
			</CardBody>
		</Card>
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
  // contentTypes: PropTypes.array,
  // contentTypesNameFields: PropTypes.object.isRequired,
  // level: PropTypes.number,
  // levelPath: PropTypes.string,
  // isFirst: PropTypes.bool,
  // isLast: PropTypes.bool,
  // isParentAttachedToMenu: PropTypes.bool,
  // onItemClick: PropTypes.func.isRequired,
  // onItemRestoreClick: PropTypes.func.isRequired,
  // onItemLevelAddClick: PropTypes.func.isRequired,
};

export default Item;
