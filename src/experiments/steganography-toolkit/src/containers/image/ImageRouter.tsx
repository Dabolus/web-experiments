import React, { lazy, FunctionComponent } from 'react';

import { Routes, Route, Navigate } from 'react-router-dom';

import { TopbarLayoutProps } from '../../components/TopbarLayout';

const LSBRouter = lazy(() => import('./lsb/LSBRouter'));

const TextRouter: FunctionComponent<TopbarLayoutProps> = props => (
  <Routes>
    <Route path="/lsb/:tab?" element={<LSBRouter {...props} />} />
    <Route path="*" element={<Navigate to="/lsb" replace />} />
  </Routes>
);

export default TextRouter;
