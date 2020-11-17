import styled from 'styled-components';

import { colors, sizes } from 'strapi-helper-plugin';
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

      background-color: ${backgroundColor};
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
    top: ${({ isFirst, isLast }) => {
      if (isFirst && isLast) {
        return '-2.5rem';
      }
      if (isFirst && !isLast) {
        return '-2rem';
      }
      if (!isFirst && isLast) {
        return '-68%';
      }
      if (!isFirst && !isLast) {
        return 0;
      }
    }};
    bottom: ${({ isFirst, isLast }) => {
      if (isFirst && isLast) {
        return 'unset';
      }
      if (isFirst && !isLast) {
        return '-50%';
      }
      if (!isFirst && isLast) {
        return '50%';
      }
      if (!isFirst && !isLast) {
        return 0;
      }
    }};
    height: ${({ isFirst, isLast }) => {
      if (isFirst && isLast) {
        return '15.5%';
      }
    }};
    left: -2rem;
    z-index: -1;

    background-color: ${backgroundColor};
  }
`;

export default CardWrapper;
