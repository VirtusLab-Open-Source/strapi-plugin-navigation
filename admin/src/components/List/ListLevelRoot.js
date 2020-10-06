import styled from "styled-components";

import CardItemLevelAdd, { buttonRadius } from "../Item/CardItemLevelAdd";

const ListLevelRoot = styled.li`
  position: relative;

  ${CardItemLevelAdd} {
    margin-left: ${`calc(2rem - ${buttonRadius}px)`};

    position: relative;
    top: auto;
    left: auto;
    bottom: auto;
  }
`;

export default ListLevelRoot;
