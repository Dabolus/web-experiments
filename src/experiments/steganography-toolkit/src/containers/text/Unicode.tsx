import React, { FunctionComponent } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import TopbarLayout, { TopbarLayoutProps } from '../../components/TopbarLayout';
import UnicodeInfo from '../../components/text/unicode/UnicodeInfo';
import UnicodeConcealer from '../../components/text/unicode/UnicodeConcealer';
import UnicodeRevealer from '../../components/text/unicode/UnicodeRevealer';
import TabLink from '../../components/TabLink';

enum UnicodeTab {
  INFO = 'info',
  CONCEAL = 'conceal',
  REVEAL = 'reveal',
}
const unicodeTabsNames = Object.values(UnicodeTab);
const unicodeTabsIndexes = Object.fromEntries(
  unicodeTabsNames.map((tab, index) => [tab, index]),
);

const Unicode: FunctionComponent<TopbarLayoutProps> = props => {
  const { tab } = useParams();
  const navigate = useNavigate();

  const handleIndexChange = (index: number) => {
    navigate(`../unicode/${unicodeTabsNames[index]}`);
  };

  if (!tab) {
    return <Navigate to={`../unicode/${UnicodeTab.INFO}`} replace />;
  }

  return (
    <TabContext value={tab}>
      <TopbarLayout
        title="Unicode"
        topbarContent={
          <TabList textColor="inherit" indicatorColor="secondary" centered>
            <TabLink
              to={`../unicode/${UnicodeTab.INFO}`}
              value={UnicodeTab.INFO}
              label="Info"
            />
            <TabLink
              to={`../unicode/${UnicodeTab.CONCEAL}`}
              value={UnicodeTab.CONCEAL}
              label="Conceal"
            />
            <TabLink
              to={`../unicode/${UnicodeTab.REVEAL}`}
              value={UnicodeTab.REVEAL}
              label="Reveal"
            />
          </TabList>
        }
        {...props}
      >
        <SwipeableViews
          index={unicodeTabsIndexes[tab]}
          onChangeIndex={handleIndexChange}
        >
          <TabPanel value={UnicodeTab.INFO}>
            <UnicodeInfo />
          </TabPanel>
          <TabPanel value={UnicodeTab.CONCEAL}>
            <UnicodeConcealer />
          </TabPanel>
          <TabPanel value={UnicodeTab.REVEAL}>
            <UnicodeRevealer />
          </TabPanel>
        </SwipeableViews>
      </TopbarLayout>
    </TabContext>
  );
};

export default Unicode;
