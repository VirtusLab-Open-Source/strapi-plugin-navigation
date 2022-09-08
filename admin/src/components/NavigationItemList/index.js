import React from 'react';
import PropTypes from "prop-types";

import Item from "../Item";
import Wrapper from "./Wrapper";

const List = ({
  config,
  displayFlat,
  isParentAttachedToMenu = false,
  items,
  level = 0,
  levelPath = '',
  onItemEdit,
  onItemLevelAdd,
  onItemRemove,
  onItemReOrder,
  onItemRestore,
  onItemToggleCollapse,
}) => (
  <Wrapper level={level}>
    {items.map((item, n) => {
      const { relatedRef, ...itemProps } = item
      return (
        <Item
          config={config}
          displayChildren={displayFlat}
          isLast={n === items.length - 1}
          isParentAttachedToMenu={isParentAttachedToMenu}
          item={itemProps}
          key={`list-item-${item.viewId || n}`}
          level={level}
          levelPath={levelPath}
          onItemEdit={onItemEdit}
          onItemLevelAdd={onItemLevelAdd}
          onItemRemove={onItemRemove}
          onItemReOrder={onItemReOrder}
          onItemRestore={onItemRestore}
          onItemToggleCollapse={onItemToggleCollapse}
          relatedRef={relatedRef}
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