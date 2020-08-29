import React, { useState, useEffect, useRef, useContext } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import { useHistory } from 'react-router-dom'
import { debounce } from "debounce";

// hooks
import { useFluxAuth } from '../../App';

// config
import { categoryFilters } from '../../config/filters';

// common
import ContentWrapper from '../../components/common/ContentWrapper';
import OverviewToggle from '../../components/common/OverviewToggle';
import CategoryFilters from '../../components/common/CategoryFilters';
import Paragraph from '../../components/common/Paragraph';
import Button from '../../components/common/Button';
import { FlexWrapper } from '../../components/common/Flex';
import Footer from '../../components/common/Footer';
import Loader from '../../components/common/Loader';

// modules
import MarketOverview from '../../components/modules/MarketOverview';
import CreateMarketForm from '../../components/modules/CreateMarketForm';

// context
import { FluxContext } from '../../context/FluxProvider';

const fluxLogo = require('../../assets/images/flux-logo.png');

const BackgroundWave = styled.div`
  display: none;

  @media (min-width: ${({ theme }) => theme.largeBreakpoint}) {
    z-index: -1;
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100%;
    width: 100vw;
    background: url(${props => props.theme.backgroundWave}) no-repeat;
    background-size: 100%;
    background-color: ${props => props.theme.background };
  }
`;

const WelcomeHeader = styled.h1`  
  margin: 0;
  font-size: 1.5rem;
`;

const customStyles = {
  content : {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    maxWidth: '33rem',
    maxHeight: '95vh',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#2C2A43',
    border: 'none',
    borderRadius: '10px'
  }, 
  overlay: {
    zIndex: 999,
    backgroundColor: 'rgba(12,11,29, 0.6)',
  },
};

const CloseModalButton = styled.button`
  position: absolute;
  width: 6.5em;
  top: 1rem;
  right: 1rem;
  background: rgba(15,14,37,100);
  color: rgba(247, 1, 154, 1);
  font-size: 0.8em;
  border-radius: 10px;
  border: none;
  outline: none;
  padding: 0.5rem .1rem;
  cursor: pointer;
`;

const FluxLogo = styled.img`
  width: 5em;
  margin-left: 1em;
`;

const Dashboard = props => {
  const { user } = useFluxAuth();
  const [markets, setMarkets] = useState([]);
  const [resoluteMarkets, setResoluteMarkets] = useState([]);
  const [flux, _] = useContext(FluxContext);
  const [overviewType, setOverviewType] = useState('trade');
  const [activeFilters, setActiveFilters] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [reachedScrollBottom, setReachedScrollBottom] = useState(false);
  const isFirstRun = useRef(true);
  const history = useHistory()
  
  const handleScroll = () => {
    const container = document.getElementById('marketOverviewContainer');
    if (!container) return;
    const bottom = container.getBoundingClientRect().bottom <= window.innerHeight;

    if (bottom) setReachedScrollBottom(true);
  }
  const scrolling = debounce(handleScroll, 500);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentParams = params.getAll('categories');
    setActiveFilters(currentParams);
    window.addEventListener('scroll', scrolling);

    Modal.setAppElement('#root');

    return () => {
      window.removeEventListener('scroll', scrolling);
    }
  }, []);

  useEffect(() => {
    const unlisten = history.listen((location) => {
      setActiveFilters([]);
    })

    return () => {
      unlisten();
    }
  },[history]);

  useEffect(() => {
    if (!reachedScrollBottom) return;
    if (reachedScrollBottom) {
      getMarkets(overviewType);
    }
  },[reachedScrollBottom]);

  const handleOverviewToggle = async (type) => {
    setOverviewType(type);
  }

  const getMarkets = (type = 'all', offset) => {
    const params = {};

    if (activeFilters.length) params.categories = activeFilters;
    else if (params.categories) delete params.categories;
   
    if (type === 'all' || type === 'trade') {
      flux.getMarkets(params, 9, offset !== undefined ? offset : markets.length).then(res => {
        getLastFilledPrices(params, res.data);
        setReachedScrollBottom(false);
      })
    }

    if (type === 'all' || type === 'resolute') {
      flux.getResolutingMarkets(params, 9, offset !== undefined ? offset : resoluteMarkets.length).then(res => {
        setResoluteMarkets(res);
        setReachedScrollBottom(false);
      })
    }

  }

  const getLastFilledPrices = async (params, marketArr) => {
    const prices = await flux.getLastFilledPrices(params, 10, 0);
    const currentMarkets = marketArr;
    currentMarkets.forEach((market, index) => {
      if (prices[market.id]) market.prices = prices[market.id];
      else market.prices = [];
    });
    setMarkets(oldMarkets => {
      return [...oldMarkets, ...currentMarkets];
    });
  }

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    
    let url = '/';
    if (activeFilters.length) url = '/filter?';
    activeFilters.forEach(filter => {
      const prefix = url.substr(url.length - 1) === '?' ? '' : '&';
      url = url + `${prefix}categories=${filter}`;
    });
    
    window.history.replaceState(null, 'Markets', url)
    setMarkets([]);
    setResoluteMarkets([]);
    getMarkets('all', 0);
  }, [activeFilters])

  const handleFilterChange = (event) => {
    const filter = event.target.value;
    const filterIndex = activeFilters.indexOf(filter);

    if (filterIndex === -1) setActiveFilters([ ...activeFilters, filter]); 
    else setActiveFilters(activeFilters.filter(item => item !== filter))
  }

  const createMarket = require("../../assets/images/icons/create_market.png");

  return (
    <ContentWrapper 
      position="relative"
    >
        <ContentWrapper 
          id="marketOverviewContainer"
          maxWidth="68rem"
        >
          <FlexWrapper 
            padding="3rem 1rem 1rem 1rem"
          >

            <FlexWrapper
              flexDirection="column"
              justifyContent="center"
              width="50%"
            >
              <WelcomeHeader>
                Welcome { (user && user.id) ? user.id : '' }
              </WelcomeHeader>
              <Paragraph
                margin="0.5rem 0 0 0"
                size="0.8rem"
                opacity="0.7"
              >
                These are the latest trends.
              </Paragraph>
            </FlexWrapper>

            <FlexWrapper
              textAlign="right"
              alignItems="center"
              width="50%"
            >
              <Button 
                className="createMarketButton"
                margin="2rem 0 0 0"
                marginMedium="0 0 0 auto"
                onClick={() => {
                  setModalIsOpen(true);
                }}
              >
              <img src={createMarket} alt="create market icon" />
              <span>create market</span>
            </Button>
            </FlexWrapper>
            
          </FlexWrapper>
          <OverviewToggle onToggle={handleOverviewToggle}/>

          <ContentWrapper padding="1rem">
            <CategoryFilters 
              filters={categoryFilters} 
              activeFilters={activeFilters}
              filterChange={handleFilterChange}
            />
          </ContentWrapper>

          {(overviewType === 'trade') ? (
            <MarketOverview 
              markets={markets}
              type="trade"
            />
          ) : (overviewType === 'resolute') ? (
            <MarketOverview 
              markets={resoluteMarkets}
              type="resolute"
            />
          ) : (
            <ContentWrapper padding="1rem">
              <p>No markets found.</p>
            </ContentWrapper>
          )}

          {reachedScrollBottom &&
            <ContentWrapper
              padding="1rem"
              textAlign="center"
            >
              <Loader />
            </ContentWrapper>        
          }

        </ContentWrapper>

        <Modal
          isOpen={modalIsOpen}
          style={customStyles}
          contentLabel="Create market"
        >
          <FluxLogo alt="fluxLogo" src={fluxLogo} />
          <CloseModalButton onClick={() => {
            setModalIsOpen(false);
          }}>cancel</CloseModalButton>
          <CreateMarketForm />
        </Modal>
      <Footer />
      <BackgroundWave />
    </ContentWrapper>
  );
}

export default Dashboard;