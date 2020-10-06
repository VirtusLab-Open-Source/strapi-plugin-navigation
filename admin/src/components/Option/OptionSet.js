import styled from "styled-components";

import { sizes } from "strapi-helper-plugin";

const OptionSet = styled.div`
  display: block;
  margin-bottom: ${sizes.margin}px;

  &:empty {
    display: none;
  }
`;

export default OptionSet;
