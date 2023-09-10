import React, { FunctionComponent } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import TopbarLayout, { TopbarLayoutProps } from '../../components/TopbarLayout';
import Cicada3301DyadsInfo from '../../components/music/cicada-3301-dyads/Cicada3301DyadsInfo';
import Cicada3301DyadsConcealer from '../../components/music/cicada-3301-dyads/Cicada3301DyadsConcealer';
import TabLink from '../../components/TabLink';

enum Cicada3301DyadsTab {
  INFO = 'info',
  CONCEAL = 'conceal',
}
const cicada3301DyadsTabsNames = Object.values(Cicada3301DyadsTab);
const cicada3301DyadsTabsIndexes = Object.fromEntries(
  cicada3301DyadsTabsNames.map((tab, index) => [tab, index]),
);

const Cicada3301Dyads: FunctionComponent<TopbarLayoutProps> = props => {
  const { tab } = useParams();
  const navigate = useNavigate();

  const handleIndexChange = (index: number) => {
    navigate(`../cicada-3301-dyads/${cicada3301DyadsTabsNames[index]}`);
  };

  if (!tab) {
    return (
      <Navigate
        to={`../cicada-3301-dyads/${Cicada3301DyadsTab.INFO}`}
        replace
      />
    );
  }

  return (
    <TabContext value={tab}>
      <TopbarLayout
        title="Cicada 3301 Dyads"
        topbarContent={
          <TabList textColor="inherit" indicatorColor="secondary" centered>
            <TabLink
              to={`../cicada-3301-dyads/${Cicada3301DyadsTab.INFO}`}
              value={Cicada3301DyadsTab.INFO}
              label="Info"
            />
            <TabLink
              to={`../cicada-3301-dyads/${Cicada3301DyadsTab.CONCEAL}`}
              value={Cicada3301DyadsTab.CONCEAL}
              label="Conceal"
            />
          </TabList>
        }
        {...props}
      >
        <SwipeableViews
          index={cicada3301DyadsTabsIndexes[tab]}
          onChangeIndex={handleIndexChange}
        >
          <TabPanel value={Cicada3301DyadsTab.INFO}>
            <Cicada3301DyadsInfo />
          </TabPanel>
          <TabPanel value={Cicada3301DyadsTab.CONCEAL}>
            <Cicada3301DyadsConcealer />
          </TabPanel>
        </SwipeableViews>
      </TopbarLayout>
    </TabContext>
  );
};

export default Cicada3301Dyads;
