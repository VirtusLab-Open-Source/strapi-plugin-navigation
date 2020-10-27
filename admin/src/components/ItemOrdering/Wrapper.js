import styled from "styled-components";
import CardOrderingButton from "./CardOrderingButton";

const Wrapper = styled.div`
  display: flex;

  flex-direction: row;
  justify-content: center;
  align-items: center;

  position: absolute;
  left: 0;
  right: 0;
  bottom: ${ props => -1 * (props.fixBy || 0) }px;
  z-index: 1;

  ${ CardOrderingButton } {
    &:first {
      margin-left: 0;
    }
  }
`;

export default Wrapper;
