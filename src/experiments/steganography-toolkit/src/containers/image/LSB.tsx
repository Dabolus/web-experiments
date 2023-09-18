import React, { FunctionComponent } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import TopbarLayout, { TopbarLayoutProps } from '../../components/TopbarLayout';
import LSBInfo from '../../components/image/lsb/LSBInfo';
import LSBConcealer from '../../components/image/lsb/LSBConcealer';
import TabLink from '../../components/TabLink';

enum LSBTab {
  INFO = 'info',
  CONCEAL = 'conceal',
}
const lsbTabsNames = Object.values(LSBTab);
const lsbTabsIndexes = Object.fromEntries(
  lsbTabsNames.map((tab, index) => [tab, index]),
);

const LSB: FunctionComponent<TopbarLayoutProps> = props => {
  const { tab } = useParams();
  const navigate = useNavigate();

  const handleIndexChange = (index: number) => {
    navigate(`../lsb/${lsbTabsNames[index]}`);
  };

  if (!tab) {
    return <Navigate to={`../lsb/${LSBTab.INFO}`} replace />;
  }

  return (
    <TabContext value={tab}>
      <TopbarLayout
        title="Least Significant Bit"
        topbarContent={
          <TabList textColor="inherit" indicatorColor="secondary" centered>
            <TabLink
              to={`../lsb/${LSBTab.INFO}`}
              value={LSBTab.INFO}
              label="Info"
            />
            <TabLink
              to={`../lsb/${LSBTab.CONCEAL}`}
              value={LSBTab.CONCEAL}
              label="Conceal"
            />
          </TabList>
        }
        {...props}
      >
        <SwipeableViews
          index={lsbTabsIndexes[tab]}
          onChangeIndex={handleIndexChange}
        >
          <TabPanel value={LSBTab.INFO}>
            <LSBInfo />
          </TabPanel>
          <TabPanel value={LSBTab.CONCEAL}>
            <LSBConcealer />
          </TabPanel>
        </SwipeableViews>
      </TopbarLayout>
    </TabContext>
  );
};

export default LSB;
