import React, { lazy, FunctionComponent } from 'react';

import { useRouteMatch, Switch, Route, Redirect } from 'react-router-dom';

import { TopbarLayoutProps } from '../../components/TopbarLayout';

const Solresol = lazy(() => import('./Solresol'));
const Cicada3301 = lazy(() => import('./Cicada3301'));

const MusicRouter: FunctionComponent<TopbarLayoutProps> = (props) => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/solresol`}>
        <Switch>
          <Route exact path={`${path}/solresol`}>
            <Solresol {...props} />
          </Route>

          <Redirect to={`${path}/solresol`} />
        </Switch>
      </Route>

      <Route path={`${path}/cicada-3301`}>
        <Switch>
          <Route exact path={`${path}/cicada-3301`}>
            <Cicada3301 {...props} />
          </Route>

          <Redirect to={`${path}/cicada-3301`} />
        </Switch>
      </Route>

      <Redirect to={`${path}/solresol`} />
    </Switch>
  );
};

export default MusicRouter;
