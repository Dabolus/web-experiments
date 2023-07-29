import React, { FunctionComponent } from 'react';

import { BrowserRouter } from 'react-router-dom';

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
          <BrowserRouter basename="/steganography-toolkit/">
            <Root />
          </BrowserRouter>
        </ServiceWorkerProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
