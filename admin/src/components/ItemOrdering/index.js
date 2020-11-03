import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import Wrapper from "./Wrapper";
import CardOrderingButton from "./CardOrderingButton";
import { sizes } from "strapi-helper-plugin";

const BUTTON_SIZE = 2.4 * sizes.margin;

const ItemOrdering = ({ isFirst, isLast, onChangeOrder }) => {
  return (
    <Wrapper fixBy={ BUTTON_SIZE / 2 }>
      { !isFirst && (<CardOrderingButton
        size={BUTTON_SIZE}
        color="secondary"
        icon={<FontAwesomeIcon icon={faArrowUp} size="1x" />}
        onClick={(e) => onChangeOrder(e, -1)}
      />) }
      { !isLast && (<CardOrderingButton
        size={BUTTON_SIZE}
        color="secondary"
        icon={<FontAwesomeIcon icon={faArrowDown} size="1x" />}
        onClick={(e) => onChangeOrder(e, 1)}
      />) }
    </Wrapper>
  );
};

ItemOrdering.propTypes = {
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
  onChangeOrder: PropTypes.func.isRequired,
};

export default ItemOrdering;
