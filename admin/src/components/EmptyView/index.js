import styled from "styled-components";
import { Box } from '@strapi/design-system/Box';
import { Button } from "@strapi/design-system/Button";

const EmptyView = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-left: 2rem;
  padding-right: 2rem;
  padding-bottom: 8rem;


  font-size: 2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.neutral600};
  text-align: center;

	> {
		margin: 1rem;
	}
`;

export default EmptyView;
