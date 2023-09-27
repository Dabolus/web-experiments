import React, { lazy, FunctionComponent } from 'react';

import { Routes, Route, Navigate } from 'react-router-dom';

import { TopbarLayoutProps } from '../../components/TopbarLayout';

const UnicodeRouter = lazy(() => import('./unicode/UnicodeRouter'));

const TextRouter: FunctionComponent<TopbarLayoutProps> = props => (
  <Routes>
    <Route path="/unicode/:tab?" element={<UnicodeRouter {...props} />} />
    <Route path="*" element={<Navigate to="/unicode" replace />} />
  </Routes>
);

export default TextRouter;
