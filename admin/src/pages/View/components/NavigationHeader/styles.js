import styled from 'styled-components';
import { IconButton } from '@strapi/design-system/IconButton';

export const MoreButton = styled(IconButton)`
    margin: ${({ theme }) => `0 ${theme.spaces[2]}`};
    padding: ${({ theme }) => theme.spaces[2]};

    svg {
        width: ${18 / 16}rem;
        height: ${18 / 16}rem;
    }
`;

