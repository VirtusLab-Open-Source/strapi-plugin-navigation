import React from 'react';
// @ts-ignore
import styled from 'styled-components';
// @ts-ignore
import { Drag } from '@strapi/icons'
import { ToBeFixed } from '../../../../types';

const DRAG_BUTTON_SIZE_IN_REM = 2;
const DragButtonWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;

  height: ${DRAG_BUTTON_SIZE_IN_REM}rem;
  width: ${DRAG_BUTTON_SIZE_IN_REM}rem;
  padding: ${({ theme }: ToBeFixed) => theme.spaces[2]};

  background: ${({ theme, isActive }: ToBeFixed) => isActive ? theme.colors.neutral150 : theme.colors.neutral0};
  border: 1px solid ${({ theme }: ToBeFixed) => theme.colors.neutral200};
  border-radius: ${({ theme }: ToBeFixed) => theme.borderRadius};
  cursor: pointer;
  transition: background-color 0.3s ease-in;

  svg {
    height: ${({ theme }: ToBeFixed) => theme.spaces[3]};
    width: ${({ theme }: ToBeFixed) => theme.spaces[3]};

    > g,
    path {
      fill: ${({ theme }: ToBeFixed) => theme.colors.neutral500};
    }
  }
  &:hover {
    svg {
      > g,
      path {
        fill: ${({ theme }: ToBeFixed) => theme.colors.neutral600};
      }
    }
  }
  &:active {
    svg {
      > g,
      path {
        fill: ${({ theme }: ToBeFixed) => theme.colors.neutral400};
      }
    }
  }
  &[aria-disabled='true'] {
    background-color: ${({ theme }: ToBeFixed) => theme.colors.neutral150};
    svg {
      path {
        fill: ${({ theme }: ToBeFixed) => theme.colors.neutral600};
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