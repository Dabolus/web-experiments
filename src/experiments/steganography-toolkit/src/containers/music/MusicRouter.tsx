import React, { lazy, FunctionComponent } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TopbarLayoutProps } from '../../components/TopbarLayout';

const SolresolRouter = lazy(() => import('./solresol/SolresolRouter'));
const SpectrogramRouter = lazy(() => import('./spectrogram/SpectrogramRouter'));
const Cicada3301DyadsRouter = lazy(
  () => import('./cicada-3301-dyads/Cicada3301DyadsRouter'),
);

const MusicRouter: FunctionComponent<TopbarLayoutProps> = props => (
  <Routes>
    <Route path="/solresol/:tab?" element={<SolresolRouter {...props} />} />
    <Route
      path="/spectrogram/:tab?"
      element={<SpectrogramRouter {...props} />}
    />
    <Route
      path="/cicada-3301-dyads/:tab?"
      element={<Cicada3301DyadsRouter {...props} />}
    />
    <Route path="*" element={<Navigate to="/solresol/info" replace />} />
  </Routes>
);

export default MusicRouter;
