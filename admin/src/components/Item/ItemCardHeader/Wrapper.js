import styled from "styled-components";
import { CardTitle } from '@strapi/design-system/Card';

const CardItemTitle = styled(CardTitle)`
	width: 100%;
	
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	
	color: ${({ theme }) => theme.colors.neutral800};
	font-size: ${({ theme }) => theme.fontSizes[2]};
	font-weight: ${({ theme }) => theme.fontWeights.bold};

	> div > * {
			margin: 0px ${({ theme }) => theme.spaces[1]};
	}
`;

export default CardItemTitle;
