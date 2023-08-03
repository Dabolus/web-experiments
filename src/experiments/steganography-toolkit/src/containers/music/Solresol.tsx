import React, { FunctionComponent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Tab, Typography } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import TopbarLayout, { TopbarLayoutProps } from '../../components/TopbarLayout';
import SolresolInfo from '../../components/music/solresol/SolresolInfo';
import SolresolTranslator from '../../components/music/solresol/SolresolTranslator';

const enum SolresolTab {
  INFO = 'info',
  TRANSLATE = 'translate',
}

const Solresol: FunctionComponent<TopbarLayoutProps> = props => {
  const { tab = SolresolTab.INFO } = useParams();

  return (
    <TabContext value={tab}>
      <TopbarLayout
        title="Solresol"
        topbarContent={
          <TabList textColor="inherit" indicatorColor="secondary" centered>
            <Tab
              component={Link}
              to={`../solresol/${SolresolTab.INFO}`}
              value={SolresolTab.INFO}
              label={
                <Typography variant="button" component="h3">
                  Info
                </Typography>
              }
            />
            <Tab
              component={Link}
              to={`../solresol/${SolresolTab.TRANSLATE}`}
              value={SolresolTab.TRANSLATE}
              label={
                <Typography variant="button" component="h3">
                  Translate
                </Typography>
              }
            />
          </TabList>
        }
        {...props}
      >
        <TabPanel value={SolresolTab.INFO}>{<SolresolInfo />}</TabPanel>
        <TabPanel value={SolresolTab.TRANSLATE}>
          {<SolresolTranslator />}
        </TabPanel>
      </TopbarLayout>
    </TabContext>
  );
};

export default Solresol;
