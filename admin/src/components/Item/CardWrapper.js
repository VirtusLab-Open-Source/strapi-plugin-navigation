import styled from 'styled-components';

import { colors } from 'strapi-helper-plugin';
import CardItem from './CardItem';

const backgroundColor = ({ error, theme }) => {
  if (error) {
    return theme.main.colors.red;
  }
  return colors.relations.boxShadow;
};

const CardWrapper = styled.li`
  padding: 0;
  margin: 0;

  position: relative;
  z-index: 1;

  ${CardItem} {
    &:before {
      display: block;
      content: "";
      margin-top: -1px;

      height: 2px;
      width: 2.5rem;

      position: absolute;
      top: 50%;
      left: -2rem;
      z-index: -1;

      background-color: ${backgroundColor};
    }
  }

  &:last-child {
    &:before {
      display: ${(props) => (props.level < 2 ? 'none' : 'block')};
      content: "";
      width: 6px;
      height: 6px;
      margin-left: -3px;

      position: absolute;
      bottom: -2.5rem;
      left: -2rem;
      z-index: -1;

      border-radius: 3px;

      background-color: ${colors.relations.boxShadow};
    }

    ${CardItem} {
      margin-bottom: 20px;
    }
  }

  &:after {
    display: block;
    content: "";
    margin-left: -1px;

    width: 2px;

    position: absolute;
    top: -2rem;
    bottom: -2.5rem;
    left: -2rem;
    z-index: -1;

    background-color: ${colors.relations.boxShadow};
  }
`;

export default CardWrapper;
