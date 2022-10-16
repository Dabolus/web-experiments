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

import MusicRouter from './music/MusicRouter';

const Home = lazy(() => import('../components/Home'));

const Root: FunctionComponent = () => {
  const { assetsUpdateReady, updateAssets } = useServiceWorker();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = useCallback(() => {
    setIsUpdating(true);
    updateAssets();
  }, [updateAssets]);

  const handleMenuButtonClick = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
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

            <Route path="/text/*" element={<>Text</>} />

            <Route path="/image/*" element={<>Image</>} />

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
        open={assetsUpdateReady}
        message="Update available!"
        action={
          <Button
            color="secondary"
            size="small"
            autoFocus
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
