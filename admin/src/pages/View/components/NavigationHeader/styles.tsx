//@ts-ignore
import styled from 'styled-components';
//@ts-ignore
import { IconButton } from '@strapi/design-system/IconButton';
import { ToBeFixed } from '../../../../../../types';

export const MoreButton = styled(IconButton)`
    margin: ${({ theme }: ToBeFixed) => `0 ${theme.spaces[2]}`};
    padding: ${({ theme }: ToBeFixed) => theme.spaces[2]};

    svg {
        width: ${18 / 16}rem;
        height: ${18 / 16}rem;
    }
`;

