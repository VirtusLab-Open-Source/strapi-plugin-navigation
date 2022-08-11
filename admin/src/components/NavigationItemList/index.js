import React from 'react';
import PropTypes from "prop-types";

import Item from "../Item";
import Wrapper from "./Wrapper";

const List = ({
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
          onItemRestore={onItemRestore}
          onItemLevelAdd={onItemLevelAdd}
          onItemRemove={onItemRemove}
          onItemEdit={onItemEdit}
          onItemReOrder={onItemReOrder}
          onItemToggleCollapse={onItemToggleCollapse}
          displayChildren={displayFlat}
        />
      );
    })}
  </Wrapper>
);

List.propTypes = {
  isParentAttachedToMenu: PropTypes.bool,
  items: PropTypes.array,
  level: PropTypes.number,
  onItemLevelAdd: PropTypes.func.isRequired,
  onItemRemove: PropTypes.func.isRequired,
  onItemRestore: PropTypes.func.isRequired,
  onItemRestore: PropTypes.func.isRequired,
  onItemReOrder: PropTypes.func.isRequired,
  onItemToggleCollapse: PropTypes.func.isRequired,
};

export default List;