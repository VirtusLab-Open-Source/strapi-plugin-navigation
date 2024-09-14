import styled from "styled-components";

const initSize = 92;

const NavigationIconSvg = styled.svg`
  path {
    fill: ${ ({ theme }) => theme.colors.neutral500 };
  }
`;

export const NavigationIcon = ({ width = 24, height = 24 }) => (
  <NavigationIconSvg
    viewBox={`0px 0px ${width}px ${height}px`}
    xmlns="http://www.w3.org/2000/svg"
    height={height}
    width={width}
  >
    <g style={{ transform: `scale(${width / initSize})` }}>
      <path
        d="M78,23.5H14c-3.6,0-6.5-2.9-6.5-6.5s2.9-6.5,6.5-6.5h64c3.6,0,6.5,2.9,6.5,6.5S81.6,23.5,78,23.5z M84.5,46
        c0-3.6-2.9-6.5-6.5-6.5H14c-3.6,0-6.5,2.9-6.5,6.5s2.9,6.5,6.5,6.5h64C81.6,52.5,84.5,49.6,84.5,46z M84.5,75c0-3.6-2.9-6.5-6.5-6.5
        H14c-3.6,0-6.5,2.9-6.5,6.5s2.9,6.5,6.5,6.5h64C81.6,81.5,84.5,78.6,84.5,75z"
      />
    </g>
  </NavigationIconSvg>
);