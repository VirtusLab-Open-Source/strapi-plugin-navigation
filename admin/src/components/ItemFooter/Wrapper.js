import styled from "styled-components";

import { colors } from "strapi-helper-plugin";

const Wrapper = styled.div`
  display: flex;
  padding-top: 1rem;
  margin-top: 1rem;
  margin-bottom: ${ props => props.attachButtons ? 1 : 0 }rem;

  flex-wrap: wrap;
  justify-items: center;
  align-items: stretch;

  color: ${colors.leftMenu.darkGrey};
  font-size: 1.25rem;

  border-top: 1px ${colors.leftMenu.lightGrey} solid;

  ${ props => props.removed && `
    filter: blur(.25rem);
    -webkit-filter: blur(.25rem);
  `}
`;

export default Wrapper;
