import React from "react";
import PropTypes from "prop-types";
import { Plus, Remove } from "@buffetjs/icons";
import { upperFirst } from "lodash";
import OptionButton from "./OptionButton";
import Wrapper from "./Wrapper";

function Option({ label, icon = Option.icons.REMOVE, onClick, ...rest }) {
  const content =
    typeof label === "string" ? <span>{upperFirst(label)}</span> : label;

  let OptionIcon = Remove;
  switch (icon) {
    case Option.icons.PLUS:
      OptionIcon = Plus;
      break;
    default:
      break;
  }

  return (
    <Wrapper {...rest}>
      {content}
      <OptionButton type="button" onClick={onClick}>
        <OptionIcon width="11px" height="11px" fill="#007eff" />
      </OptionButton>
    </Wrapper>
  );
}

Option.icons = {
  PLUS: "plus",
  REMOVE: "remove",
};

Option.defaultProps = {
  label: "",
  onClick: () => {},
};

Option.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  icon: PropTypes.oneOf([Option.icons.PLUS, Option.icons.REMOVE]),
  onClick: PropTypes.func,
};

export default Option;
