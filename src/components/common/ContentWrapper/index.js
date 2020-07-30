import styled from 'styled-components';

const ContentWrapper = styled.div`
  display: ${props => props.hideForSmall ? 'none' : 'block'};
  position: ${props => props.position ? props.position : 'initial'};
  min-height: initial;
  max-width: ${props => props.maxWidth ? '78rem' : 'none'};
  margin: 0 auto;
  padding: ${props => props.padding ? props.padding : 0};
  background-color: ${props => props.backgroundColor ? props.theme[props.backgroundColor] : 'transparent'};
  overflow: ${props => props.overflow ? props.overflow : 'initial'};

  @media (min-width: ${({ theme }) => theme.mediumBreakpoint}) {
    display: ${props => props.hideForMedium ? 'none' : 'block'};
    min-height: ${props => props.minHeight ? props.minHeight : 'initial'};
  }

  @media (min-width: ${({ theme }) => theme.largeBreakpoint}) {
    display: ${props => props.hideForLarge ? 'none' : 'block'};
  }
`;

export default ContentWrapper;
