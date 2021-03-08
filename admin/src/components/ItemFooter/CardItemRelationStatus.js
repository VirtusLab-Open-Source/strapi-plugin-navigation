import styled from "styled-components";

import { colors, sizes } from "strapi-helper-plugin";

const CardItemRelationStatus = styled.small`
  display: inline-block;
  padding: ${`${sizes.margin * .1}px ${sizes.margin * .5}px`};
  margin-left: ${`${sizes.margin / 2}px`};
  
  color: #ffffff;
  font-weight: bold;

  background: orange;
  border-radius: ${`${sizes.margin * .3}px`};
`;

export default CardItemRelationStatus;
