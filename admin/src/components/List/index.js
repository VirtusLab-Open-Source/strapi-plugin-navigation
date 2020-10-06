import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Item from "../Item";
import Container from "./Container";
import CardItemLevelAdd from "../Item/CardItemLevelAdd";
import ListLevelRoot from "./ListLevelRoot";

const List = ({
  root,
  items,
  onItemClick,
  onItemRestoreClick,
  onItemLevelAddClick,
  as,
  level = 0,
  allowedLevels,
}) => {
  const Component = as || Container;
  return (
    <Component>
      {items.map((item, n) => {
        const { relatedRef, ...itemProps } = item
        return (
          <Item
            key={`list-item-${item.viewId || n}`}
            item={itemProps}
            relatedRef={relatedRef}
            level={level}
            allowedLevels={allowedLevels}
            onItemClick={onItemClick}
            onItemRestoreClick={onItemRestoreClick}
            onItemLevelAddClick={onItemLevelAddClick}
          />
        );
      })}
      {root && (
        <ListLevelRoot>
          <CardItemLevelAdd
            root
            menuLevel
            color="primary"
            icon={<FontAwesomeIcon icon={faPlus} />}
            onClick={onItemLevelAddClick}
          />
        </ListLevelRoot>
      )}
    </Component>
  );
};

List.propTypes = {
  root: PropTypes.bool,
  items: PropTypes.array,
  level: PropTypes.number,
  allowedLevels: PropTypes.number,
  onItemClick: PropTypes.func.isRequired,
  onItemRestoreClick: PropTypes.func.isRequired,
  onItemLevelAddClick: PropTypes.func.isRequired,
};

export default List;
