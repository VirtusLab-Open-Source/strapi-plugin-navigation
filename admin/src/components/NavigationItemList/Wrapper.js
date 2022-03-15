import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
  ${({ level, theme }) => level && `
    &::before {
      content: "";
      display: block;
      height: ${theme.spaces[3]};
      width: 19px;

      position: absolute;
      top: -${theme.spaces[2]};
      left: 30px;
      
      border: 0px solid transparent;
      border-left: 4px solid ${theme.colors.neutral300};
    }
  `};
`;

export default Wrapper;