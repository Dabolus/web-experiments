import React, { lazy, FunctionComponent } from 'react';

import { Routes, Route, Navigate } from 'react-router-dom';

import { TopbarLayoutProps } from '../../components/TopbarLayout';

const Solresol = lazy(() => import('./Solresol'));
const Cicada3301 = lazy(() => import('./Cicada3301'));

const MusicRouter: FunctionComponent<TopbarLayoutProps> = props => (
  <Routes>
    <Route path="/solresol/*" element={<Solresol {...props} />} />

    <Route path="/cicada-3301/*" element={<Cicada3301 {...props} />} />

    <Route path="*" element={<Navigate to="/solresol" replace />} />
  </Routes>
);

export default MusicRouter;
