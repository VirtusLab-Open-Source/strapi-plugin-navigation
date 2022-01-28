import styled from "styled-components";
import { Badge } from '@strapi/design-system/Badge';

const ItemCardBadge = styled(Badge)`
		border: 1px solid ${({ theme, borderColor }) => theme.colors[borderColor]};

		${ props => props.small && `
			padding: 0 4px;
			vertical-align: middle;

			cursor: default;

			span {
				font-size: .55rem;
				line-height: 1;
				vertical-align: middle;
			}
		`}
`;

export default ItemCardBadge;