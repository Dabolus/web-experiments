import React, { FunctionComponent } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Tab, Typography } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import TopbarLayout, { TopbarLayoutProps } from '../../components/TopbarLayout';
import UnicodeInfo from '../../components/text/unicode/UnicodeInfo';
import UnicodeConcealer from '../../components/text/unicode/UnicodeConcealer';
import UnicodeRevealer from '../../components/text/unicode/UnicodeRevealer';

enum UnicodeTab {
  INFO = 'info',
  CONCEAL = 'conceal',
  REVEAL = 'reveal',
}

const Unicode: FunctionComponent<TopbarLayoutProps> = props => {
  const { tab = UnicodeTab.INFO } = useParams();

  return (
    <TabContext value={tab}>
      <TopbarLayout
        title="Unicode"
        topbarContent={
          <TabList textColor="inherit" indicatorColor="secondary" centered>
            <Tab
              component={RouterLink}
              to={`../unicode/${UnicodeTab.INFO}`}
              value={UnicodeTab.INFO}
              label={
                <Typography variant="button" component="h3">
                  Info
                </Typography>
              }
            />
            <Tab
              component={RouterLink}
              to={`../unicode/${UnicodeTab.CONCEAL}`}
              value={UnicodeTab.CONCEAL}
              label={
                <Typography variant="button" component="h3">
                  Conceal
                </Typography>
              }
            />
            <Tab
              component={RouterLink}
              to={`../unicode/${UnicodeTab.REVEAL}`}
              value={UnicodeTab.REVEAL}
              label={
                <Typography variant="button" component="h3">
                  Reveal
                </Typography>
              }
            />
          </TabList>
        }
        {...props}
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
      </TopbarLayout>
    </TabContext>
  );
};

export default Unicode;
