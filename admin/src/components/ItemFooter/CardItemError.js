import styled from "styled-components";

import { sizes } from "strapi-helper-plugin";
import CardItemRelation from "./CardItemRelation";

const CardItemError = styled(CardItemRelation)`
  color: red;
  font-weight: bold;
`;

export default CardItemError;
