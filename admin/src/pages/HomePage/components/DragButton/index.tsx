import { Drag } from '@strapi/icons';
import React from 'react';
import styled, { DefaultTheme } from 'styled-components';

const DragButtonWrapper = styled.span<{ ref: unknown; isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  height: 32px;
  width: 32px;
  padding: ${({ theme }) => theme.spaces[2]};

  background: ${({ theme, isActive }) =>
    isActive ? theme.colors.neutral150 : theme.colors.neutral0};
  border: 1px solid ${({ theme }) => theme.colors.neutral200};
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  transition: background-color 0.3s ease-in;

  svg {
    height: ${({ theme }) => theme.spaces[3]};
    width: ${({ theme }) => theme.spaces[3]};

    > g,
    path {
      fill: ${({ theme }) => theme.colors.neutral500};
    }
  }
  &:hover {
    svg {
      > g,
      path {
        fill: ${({ theme }) => theme.colors.neutral600};
      }
    }
  }
  &:active {
    svg {
      > g,
      path {
        fill: ${({ theme }) => theme.colors.neutral400};
      }
    }
  }
  &[aria-disabled='true'] {
    background-color: ${({ theme }) => theme.colors.neutral150};
    svg {
      path {
        fill: ${({ theme }) => theme.colors.neutral600};
      }
    }
  }
`;

const DragButton = React.forwardRef<unknown, { isActive?: boolean }>((props, ref) => (
  <DragButtonWrapper {...props} ref={ref}>
    <Drag />
  </DragButtonWrapper>
));

export default DragButton;
