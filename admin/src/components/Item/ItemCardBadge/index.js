import styled from "styled-components";
import { Badge } from '@strapi/design-system/Badge';

const ItemCardBadge = styled(Badge)`
		border: 1px solid ${({ theme, borderColor }) => theme.colors[borderColor]};

		${ ({small, theme}) => small && `
			padding: ${theme.spaces[1]} ${theme.spaces[2]};
			margin: 0px ${theme.spaces[3]};
			vertical-align: middle;

			cursor: default;

			span {
				font-size: .65rem;
				line-height: 1;
				vertical-align: middle;
			}
		`}
`;

export default ItemCardBadge;