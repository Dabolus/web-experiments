import React, { FunctionComponent } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import TopbarLayout, { TopbarLayoutProps } from '../../components/TopbarLayout';
import SolresolInfo from '../../components/music/solresol/SolresolInfo';
import SolresolTranslator from '../../components/music/solresol/SolresolTranslator';
import TabLink from '../../components/TabLink';

enum SolresolTab {
  INFO = 'info',
  TRANSLATE = 'translate',
}
const solresolTabsNames = Object.values(SolresolTab);
const solresolTabsIndexes = Object.fromEntries(
  solresolTabsNames.map((tab, index) => [tab, index]),
);

const Solresol: FunctionComponent<TopbarLayoutProps> = props => {
  const { tab } = useParams();
  const navigate = useNavigate();

  const handleIndexChange = (index: number) => {
    navigate(`../solresol/${solresolTabsNames[index]}`);
  };

  if (!tab) {
    return <Navigate to={`../solresol/${SolresolTab.INFO}`} replace />;
  }

  return (
    <TabContext value={tab}>
      <TopbarLayout
        title="Solresol"
        topbarContent={
          <TabList textColor="inherit" indicatorColor="secondary" centered>
            <TabLink
              to={`../solresol/${SolresolTab.INFO}`}
              value={SolresolTab.INFO}
              label="Info"
            />
            <TabLink
              to={`../solresol/${SolresolTab.TRANSLATE}`}
              value={SolresolTab.TRANSLATE}
              label="Translate"
            />
          </TabList>
        }
        {...props}
      >
        <SwipeableViews
          index={solresolTabsIndexes[tab]}
          onChangeIndex={handleIndexChange}
        >
          <TabPanel value={SolresolTab.INFO}>
            <SolresolInfo />
          </TabPanel>
          <TabPanel value={SolresolTab.TRANSLATE}>
            <SolresolTranslator />
          </TabPanel>
        </SwipeableViews>
      </TopbarLayout>
    </TabContext>
  );
};

export default Solresol;
