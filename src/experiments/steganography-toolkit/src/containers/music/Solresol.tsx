import React, { FunctionComponent, useState } from 'react';
import { Tabs, Tab, Typography } from '@mui/material';
import TopbarLayout, { TopbarLayoutProps } from '../../components/TopbarLayout';
import SolresolInfo from '../../components/music/solresol/SolresolInfo';
import SolresolTranslator from '../../components/music/solresol/SolresolTranslator';

const enum SolresolTab {
  INFO = 'info',
  TRANSLATE = 'translate',
}

const Solresol: FunctionComponent<TopbarLayoutProps> = props => {
  const [currentTab, setCurrentTab] = useState(SolresolTab.INFO);

  return (
    <TopbarLayout
      title="Solresol"
      topbarContent={
        <Tabs
          value={currentTab}
          onChange={(_, newTab) => setCurrentTab(newTab)}
          textColor="inherit"
          indicatorColor="secondary"
          centered
        >
          <Tab
            value={SolresolTab.INFO}
            label={
              <Typography variant="button" component="h3">
                Info
              </Typography>
            }
          />
          <Tab
            value={SolresolTab.TRANSLATE}
            label={
              <Typography variant="button" component="h3">
                Translate
              </Typography>
            }
          />
        </Tabs>
      }
      {...props}
    >
      {currentTab === SolresolTab.INFO && <SolresolInfo />}
      {currentTab === SolresolTab.TRANSLATE && <SolresolTranslator />}
    </TopbarLayout>
  );
};

export default Solresol;
