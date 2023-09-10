import React, { FunctionComponent } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import TopbarLayout, { TopbarLayoutProps } from '../../components/TopbarLayout';
import SpectrogramInfo from '../../components/music/spectrogram/SpectrogramInfo';
import SpectrogramGenerator from '../../components/music/spectrogram/SpectrogramGenerator';
import TabLink from '../../components/TabLink';

enum SpectrogramTab {
  INFO = 'info',
  GENERATE = 'generate',
}
const spectrogramTabsNames = Object.values(SpectrogramTab);
const spectrogramTabsIndexes = Object.fromEntries(
  spectrogramTabsNames.map((tab, index) => [tab, index]),
);

const Spectrogram: FunctionComponent<TopbarLayoutProps> = props => {
  const { tab } = useParams();
  const navigate = useNavigate();

  const handleIndexChange = (index: number) => {
    navigate(`../spectrogram/${spectrogramTabsNames[index]}`);
  };

  if (!tab) {
    return <Navigate to={`../spectrogram/${SpectrogramTab.INFO}`} replace />;
  }

  return (
    <TabContext value={tab}>
      <TopbarLayout
        title="Spectrogram"
        topbarContent={
          <TabList textColor="inherit" indicatorColor="secondary" centered>
            <TabLink
              to={`../spectrogram/${SpectrogramTab.INFO}`}
              value={SpectrogramTab.INFO}
              label="Info"
            />
            <TabLink
              to={`../spectrogram/${SpectrogramTab.GENERATE}`}
              value={SpectrogramTab.GENERATE}
              label="Generate"
            />
          </TabList>
        }
        {...props}
      >
        <SwipeableViews
          index={spectrogramTabsIndexes[tab]}
          onChangeIndex={handleIndexChange}
        >
          <TabPanel value={SpectrogramTab.INFO}>
            <SpectrogramInfo />
          </TabPanel>
          <TabPanel value={SpectrogramTab.GENERATE}>
            <SpectrogramGenerator />
          </TabPanel>
        </SwipeableViews>
      </TopbarLayout>
    </TabContext>
  );
};

export default Spectrogram;
