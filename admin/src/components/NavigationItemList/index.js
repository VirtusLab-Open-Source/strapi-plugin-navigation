import React from 'react';
import PropTypes from "prop-types";

import Item from "../Item";
import Wrapper from "./Wrapper";

const List = ({
  allowedLevels,
  error,
  isParentAttachedToMenu = false,
  items,
  level = 0,
  levelPath = '',
  onItemEdit,
  onItemLevelAdd,
  onItemRemove,
  onItemRestore,
  onItemReOrder,
  onItemToggleCollapse,
  displayFlat,
  contentTypes,
  contentTypesNameFields,
}) => (
  <Wrapper level={level}>
    {items.map((item, n) => {
      const { relatedRef, ...itemProps } = item
      return (
        <Item
          key={`list-item-${item.viewId || n}`}
          item={itemProps}
          isLast={n === items.length - 1}
          relatedRef={relatedRef}
          level={level}
          levelPath={levelPath}
          isParentAttachedToMenu={isParentAttachedToMenu}
          allowedLevels={allowedLevels}
          onItemRestore={onItemRestore}
          onItemLevelAdd={onItemLevelAdd}
          onItemRemove={onItemRemove}
          onItemEdit={onItemEdit}
          onItemReOrder={onItemReOrder}
          onItemToggleCollapse={onItemToggleCollapse}
          error={error}
          displayChildren={displayFlat}
          config={{
            contentTypes,
            contentTypesNameFields
          }}
        />
      );
    })}
  </Wrapper>
);

List.propTypes = {
  allowedLevels: PropTypes.number,
  isParentAttachedToMenu: PropTypes.bool,
  items: PropTypes.array,
  level: PropTypes.number,
  onItemLevelAdd: PropTypes.func.isRequired,
  onItemRemove: PropTypes.func.isRequired,
  onItemRestore: PropTypes.func.isRequired,
  onItemRestore: PropTypes.func.isRequired,
  onItemReOrder: PropTypes.func.isRequired,
  onItemToggleCollapse: PropTypes.func.isRequired,
  contentTypes: PropTypes.array.isRequired,
  contentTypesNameFields: PropTypes.object.isRequired
};

export default List;