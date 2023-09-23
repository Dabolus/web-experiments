import React, { FunctionComponent, ReactNode } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import TopbarLayout, { TopbarLayoutProps } from './TopbarLayout';
import TabLink from './TabLink';

export interface TechniquePageTab {
  id: string;
  name: string;
  component: ReactNode;
}

export interface TechniquePageProps extends TopbarLayoutProps {
  id: string;
  name: string;
  tabs: TechniquePageTab[];
}

const TechniquePage: FunctionComponent<TechniquePageProps> = ({
  id,
  name,
  tabs,
  ...props
}) => {
  const { tab } = useParams();
  const navigate = useNavigate();

  const handleIndexChange = (index: number) => {
    navigate(`../${id}/${tabs[index].id}`);
  };

  if (!tab) {
    return <Navigate to={`../${id}/${tabs[0].id}`} replace />;
  }

  return (
    <TabContext value={tab}>
      <TopbarLayout
        title={name}
        topbarContent={
          <TabList textColor="inherit" indicatorColor="secondary" centered>
            {tabs.map(pageTab => (
              <TabLink
                key={pageTab.id}
                to={`../${id}/${pageTab.id}`}
                value={pageTab.id}
                label={pageTab.name}
              />
            ))}
          </TabList>
        }
        {...props}
      >
        <SwipeableViews
          index={tabs.findIndex(pageTab => pageTab.id === tab)}
          onChangeIndex={handleIndexChange}
        >
          {tabs.map(pageTab => (
            <TabPanel key={pageTab.id} value={pageTab.id}>
              {pageTab.component}
            </TabPanel>
          ))}
        </SwipeableViews>
      </TopbarLayout>
    </TabContext>
  );
};

export default TechniquePage;
