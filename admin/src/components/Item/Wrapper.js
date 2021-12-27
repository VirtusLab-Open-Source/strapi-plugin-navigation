import styled from "styled-components";

const Wrapper = styled.div`
position: relative;
margin-top: ${({theme}) => theme.spaces[2]};
margin-left: ${({ theme, level }) => level && theme.spaces[8]}};

${({ level, theme }) => level && `
	&::before {
		content: "";
		display: block;
		top: -103px;
		left: -24px;
		position: absolute;
		height: 108px;
		width: 19px;
		border: 0px solid transparent;
		border-left: 4px solid ${theme.colors.neutral300};
	}

	&::after {
		content: "";
		display: block;
		height: 22px;
		width: 19px;
		position: absolute;
		top: ${theme.spaces[1]};
		left: -${theme.spaces[6]};
		
		background: transparent;
		border: 4px solid ${theme.colors.neutral300};
		border-top: transparent;
		border-right: transparent;
		border-radius: 0 0 0 100%;
	}
`};
`;

export default Wrapper;