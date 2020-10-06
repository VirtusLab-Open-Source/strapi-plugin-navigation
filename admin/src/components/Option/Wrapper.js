import styled from "styled-components";

import { Option } from "@buffetjs/styles";
import { sizes } from "strapi-helper-plugin";

const Wrapper = styled(Option)`
  display: inline-flex;
  margin: 0 0 ${sizes.margin / 2}px ${sizes.margin / 2}px;

  &:first-child {
    margin-left: 0;
  }
`;

export default Wrapper;
