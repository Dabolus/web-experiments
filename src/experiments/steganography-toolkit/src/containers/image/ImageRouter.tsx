import React, { lazy, FunctionComponent } from 'react';

import { Routes, Route, Navigate } from 'react-router-dom';

import { TopbarLayoutProps } from '../../components/TopbarLayout';

const LSB = lazy(() => import('./LSB'));

const TextRouter: FunctionComponent<TopbarLayoutProps> = props => (
  <Routes>
    <Route path="/lsb/:tab?" element={<LSB {...props} />} />
    <Route path="*" element={<Navigate to="/lsb" replace />} />
  </Routes>
);

export default TextRouter;
