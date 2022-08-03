//@ts-ignore
import styled from "styled-components";
//@ts-ignore
import { CardTitle } from '@strapi/design-system/Card';
import { ToBeFixed } from "../../../../../types";

const CardItemTitle = styled(CardTitle)`
	width: 100%;
	
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	
	> div > * {
			margin: 0px ${({ theme }: ToBeFixed) => theme.spaces[1]};
	}
`;

export default CardItemTitle;
