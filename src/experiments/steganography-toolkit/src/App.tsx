import React, { FunctionComponent } from 'react';

import { BrowserRouter } from 'react-router-dom';

import {
  StyledEngineProvider,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';

import lightTheme from './themes/light';

import Root from './containers/Root';
import ServiceWorkerProvider from './providers/ServiceWorkerProvider';

const App: FunctionComponent = () => (
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <ServiceWorkerProvider>
        <BrowserRouter basename="/steganography-toolkit/">
          <Root />
        </BrowserRouter>
      </ServiceWorkerProvider>
    </ThemeProvider>
  </StyledEngineProvider>
);

export default App;
