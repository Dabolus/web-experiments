import React, { FunctionComponent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import TopbarLayout, { TopbarLayoutProps } from '../../components/TopbarLayout';
import Cicada3301Info from '../../components/music/cicada-3301/Cicada3301Info';
import Cicada3301Concealer from '../../components/music/cicada-3301/Cicada3301Concealer';
import TabLink from '../../components/TabLink';

enum Cicada3301Tab {
  INFO = 'info',
  CONCEAL = 'conceal',
}
const cicada3301TabsNames = Object.values(Cicada3301Tab);
const cicada3301TabsIndexes = Object.fromEntries(
  cicada3301TabsNames.map((tab, index) => [tab, index]),
);

const Cicada3301: FunctionComponent<TopbarLayoutProps> = props => {
  const { tab = Cicada3301Tab.INFO } = useParams();
  const navigate = useNavigate();

  const handleIndexChange = (index: number) => {
    navigate(`../cicada-3301/${cicada3301TabsNames[index]}`);
  };

  return (
    <TabContext value={tab}>
      <TopbarLayout
        title="Cicada 3301"
        topbarContent={
          <TabList textColor="inherit" indicatorColor="secondary" centered>
            <TabLink
              to={`../cicada-3301/${Cicada3301Tab.INFO}`}
              value={Cicada3301Tab.INFO}
              label="Info"
            />
            <TabLink
              to={`../cicada-3301/${Cicada3301Tab.CONCEAL}`}
              value={Cicada3301Tab.CONCEAL}
              label="Conceal"
            />
          </TabList>
        }
        {...props}
      >
        <SwipeableViews
          index={cicada3301TabsIndexes[tab]}
          onChangeIndex={handleIndexChange}
        >
          <TabPanel value={Cicada3301Tab.INFO}>
            <Cicada3301Info />
          </TabPanel>
          <TabPanel value={Cicada3301Tab.CONCEAL}>
            <Cicada3301Concealer />
          </TabPanel>
        </SwipeableViews>
      </TopbarLayout>
    </TabContext>
  );
};

export default Cicada3301;
