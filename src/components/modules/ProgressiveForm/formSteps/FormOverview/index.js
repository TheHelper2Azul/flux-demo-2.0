import React from 'react';
import styled from 'styled-components';

// common
import ContentWrapper from '../../../../common/ContentWrapper';
import { FlexWrapper, FlexItem } from '../../../../common/Flex';
import Button from '../../../../common/Button';
import Paragraph from '../../../../common/Paragraph';

const Currency = styled.span`
  display: block;
  margin: 0;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 0.4rem;
`;

const Shares = styled.span`
  display: block;
  margin: 0;
  color: white;
  font-size: 0.9rem;
  opacity: 0.7;
`;

// TODO: make the top big price total dollar price instead of share price in cents
const FormOverview = props => {
  const colorMap = {
    yes: 'lightPurple',
    no: 'pink',
  };

  return (
    <FlexWrapper
        flexDirection="column"
        height={props.layover ? '100%' : '350px'}
      >
      <FlexItem
        backgroundColor={colorMap[props.sharesType]}
        width="100%"
        flex={props.layover ? '2' : '8'}
        >
          <FlexWrapper
            padding="2rem"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            height="100%"
          >
            <ContentWrapper>
              <Currency>$</Currency>
              <Paragraph
                size="5rem"
                margin="0"
                fontWeight="bold"
                color="white"
              >
                {props.finalOrder[3]}
              </Paragraph>
            </ContentWrapper>
            <Shares>{props.finalOrder[1]} shares</Shares>
          </FlexWrapper>
        </FlexItem>
        <FlexItem 
          alignItems="center"
          justifyContent="center"
          textAlign="right"
          padding="1rem"
        >
        <FlexWrapper 
          height="100%"
          >
          <ContentWrapper
           margin="auto 0 0 0"
           width="100%"
           textAlign={props.layover ? 'center' : 'right'}
          >
            <Button
                borderColor="transparent"
                onClick={ () => {
                  props.cancel();
                }}
              >
                Cancel
              </Button>
              <Button
                margin="0 0 0 1rem"
                color={colorMap['yes']}
                onClick={ () => {
                  props.formEvent(['processing', props.finalOrder])
                }}
              >
                Confirm Trade
              </Button>
          </ContentWrapper>
        </FlexWrapper>
        </FlexItem>
    </FlexWrapper>
  );
}

export default FormOverview;