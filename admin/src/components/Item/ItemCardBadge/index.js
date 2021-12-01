import styled from "styled-components";
import { Badge } from '@strapi/design-system/Badge';

const ItemCardBadge = styled(Badge)`
		border: 1px solid ${({ theme, borderColor }) => theme.colors[borderColor]}
`;

export default ItemCardBadge;