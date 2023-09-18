import React, {
  lazy,
  Suspense,
  useState,
  useCallback,
  FunctionComponent,
} from 'react';

import { Routes, Route, Navigate } from 'react-router-dom';

import { Snackbar, Button } from '@mui/material';

import { useServiceWorker } from '../providers/ServiceWorkerProvider';

import SidebarLayout from '../components/SidebarLayout';
import SidebarMenu from '../components/SidebarMenu';
import Loader from '../components/Loader';

import TextRouter from './text/TextRouter';
import ImageRouter from './image/ImageRouter';
import MusicRouter from './music/MusicRouter';

const Home = lazy(() => import('../components/Home'));

const Root: FunctionComponent = () => {
  const { updateReady, update } = useServiceWorker();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = useCallback(() => {
    setIsUpdating(true);
    update();
  }, [update]);

  const handleMenuButtonClick = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, [sidebarOpen]);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleSidebarItemClick = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <>
      <SidebarLayout
        menuContent={<SidebarMenu onItemClick={handleSidebarItemClick} />}
        open={sidebarOpen}
        onClose={handleSidebarClose}
      >
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route
              path="/"
              element={<Home onMenuButtonClick={handleMenuButtonClick} />}
            />

            <Route
              path="/text/*"
              element={<TextRouter onMenuButtonClick={handleMenuButtonClick} />}
            />

            <Route
              path="/image/*"
              element={
                <ImageRouter onMenuButtonClick={handleMenuButtonClick} />
              }
            />

            <Route
              path="/music/*"
              element={
                <MusicRouter onMenuButtonClick={handleMenuButtonClick} />
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </SidebarLayout>

      <Snackbar
        open={updateReady}
        message="Update available!"
        action={
          <Button
            color="secondary"
            size="small"
            disabled={isUpdating}
            onClick={handleUpdate}
          >
            {isUpdating && <Loader size={24} color="secondary" />}
            Update now
          </Button>
        }
      />
    </>
  );
};

export default Root;
