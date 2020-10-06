
import styled from "styled-components";
import { ModalFooter as StrapiModalFooter, colors } from "strapi-helper-plugin";

const ModalFooter = styled(StrapiModalFooter)`
  display: flex;
  flex-direction: row;

  section {
    justify-content: flex-start;
    flex-grow: 1;

    background-color: ${colors.brightGrey};

    &:last-of-type {
      justify-content: flex-end;

      background-color: ${colors.brightGrey};

      button {
        margin-left: 1rem;
        margin-right: 0;
      }
    }

    label {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin: 0;

      color: ${colors.leftMenu.darkGrey};
      font-weight: 600;
      font-style: italic;
    }

    button {
      margin-right: 1rem;
    }
  }
`;

export default ModalFooter;
