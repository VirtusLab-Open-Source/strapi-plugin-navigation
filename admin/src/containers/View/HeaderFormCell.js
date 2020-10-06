import styled from "styled-components";
import { Header, HeaderActions } from "@buffetjs/styles";

const HeaderFormCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) =>
    props.align === "right" ? "flex-end" : "flex-start"};
  justify-content: center;
  flex-grow: ${(props) => (props.fill ? 1 : "unset")};

  ${Header} {
    margin-bottom: 0;
  }

  ${HeaderActions} {
    padding-top: 0;
  }

  .header-title {
    max-width: 100%;
  }
`;

export default HeaderFormCell;
