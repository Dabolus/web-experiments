import React, { FunctionComponent } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import {
  StyledEngineProvider,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';

import Root from './containers/Root';
import ServiceWorkerProvider from './providers/ServiceWorkerProvider';
import useTheme from './hooks/useTheme';

const App: FunctionComponent = () => {
  const { theme } = useTheme();

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ServiceWorkerProvider>
          <HelmetProvider>
            <BrowserRouter basename="/steganography-toolkit/">
              <Root />
            </BrowserRouter>
          </HelmetProvider>
        </ServiceWorkerProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
