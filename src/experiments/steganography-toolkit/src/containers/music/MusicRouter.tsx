import React, { lazy, FunctionComponent } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TopbarLayoutProps } from '../../components/TopbarLayout';

const Solresol = lazy(() => import('./Solresol'));
const Spectrogram = lazy(() => import('./Spectrogram'));
const Cicada3301Dyads = lazy(() => import('./Cicada3301Dyads'));

const MusicRouter: FunctionComponent<TopbarLayoutProps> = props => (
  <Routes>
    <Route path="/solresol/:tab?" element={<Solresol {...props} />} />
    <Route path="/spectrogram/:tab?" element={<Spectrogram {...props} />} />
    <Route
      path="/cicada-3301-dyads/:tab?"
      element={<Cicada3301Dyads {...props} />}
    />
    <Route path="*" element={<Navigate to="/solresol/info" replace />} />
  </Routes>
);

export default MusicRouter;
