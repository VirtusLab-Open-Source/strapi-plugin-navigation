import styled from "styled-components";

import { sizes } from "strapi-helper-plugin";

const CardItemType = styled.span`
  display: flex;
  flex-grow: 1;
  flex-direction: row;

  align-items: center;
  justify-content: flex-start;

  svg {
    margin-right: ${sizes.margin / 2}px;
  }
`;

export default CardItemType;
