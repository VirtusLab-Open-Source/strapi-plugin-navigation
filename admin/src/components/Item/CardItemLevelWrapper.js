import styled from "styled-components";

import { sizes } from "strapi-helper-plugin";
import CardItem from "./CardItem";

const CardItemLevelWrapper = styled.ul`
  padding: 0;
  margin: 0;

  list-style: none;

  position: relative;
  z-index: 1;

  ${CardItemLevelWrapper} {
    padding-left: ${4 * sizes.margin}px;

    position: relative;
    z-index: 0;

    ${CardItem} {
      margin-top: ${2 * sizes.margin}px;
    }
  }
`;

export default CardItemLevelWrapper;
