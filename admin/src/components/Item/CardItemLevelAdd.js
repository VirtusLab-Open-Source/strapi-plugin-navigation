import styled from "styled-components";

import { Button } from "@buffetjs/core";
import { colors, sizes } from "strapi-helper-plugin";
import { CartItemWidth } from "./CardItem";

export const buttonRadius = 1.6 * sizes.margin;

const CardItemLevelAdd = styled(Button)`
  display: flex;
  width: ${2 * buttonRadius}px;
  height: ${2 * buttonRadius}px;
  margin-left: ${(props) => (props.root ? `${-1 * buttonRadius}px` : "2rem")};
  align-items: center;
  justify-content: center;

  position: absolute;
  top: ${(props) => (props.root ? "-2rem" : `${3.2 * sizes.margin}px`)};
  bottom: auto;
  left: ${(props) => (props.root ? "2rem" : CartItemWidth)};
  z-index: 1;

  border-radius: ${buttonRadius}px;

  ${(props) =>
    !props.menuLevel &&
    `
    background: none;

    &:hover,
    &:active {
      background: none;
    }
  `}

  svg {
    margin-right: 0;
  }
`;

export default CardItemLevelAdd;
