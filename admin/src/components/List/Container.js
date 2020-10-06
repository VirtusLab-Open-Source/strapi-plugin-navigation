import { colors, sizes } from "strapi-helper-plugin";
import styled from "styled-components";

const Container = styled.ul`
  display: flex;
  padding: 0;
  flex-direction: column;
  flex-grow: 1;
  margin: 0;
  padding: ${ 2 * sizes.margin}px 0 ${ 4 * sizes.margin}px 0;

  position: relative;
  z-index: 0;

  overflow-x: hidden;
  overflow-y: auto;

  list-style: none;

  &:before {
    display: block;
    content: "";
    width: 2px;

    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(2rem - 1px);

    background-color: ${colors.relations.boxShadow};
  }
`;

export default Container;
