import styled from "styled-components";

import { Button } from "@buffetjs/core";
import { sizes } from "strapi-helper-plugin";

const CardOrderingButton = styled(Button)`
  display: flex;
  width: ${ props => props.size }px;
  height: ${ props => props.size }px;
  padding: 0;
  margin-left: ${ sizes.margin / 2 }px;
  align-items: center;
  justify-content: center;

  border-radius: ${ props => props.size / 2 }px;

  background: #ffffff;

  svg {
    margin-right: 0;
  }
`;

export default CardOrderingButton;
