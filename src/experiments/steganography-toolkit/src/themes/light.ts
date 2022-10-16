import { createTheme, Theme } from '@mui/material';

import { enUS } from '@mui/material/locale';

declare module '@mui/styles' {
  interface DefaultTheme extends Theme {}
}

const lightTheme = createTheme(
  {
    typography: {
      fontFamily: "'Jost', sans-serif",
      h1: {
        fontSize: '2rem',
        fontWeight: 800,
        margin: '1.2rem 0 0.6rem 0',
      },
      h2: {
        fontSize: '1.17rem',
        fontWeight: 700,
        margin: '1rem 0 0.5rem 0',
      },
    },
    palette: {
      mode: 'light',
      primary: {
        main: '#212121',
      },
      secondary: {
        main: '#00c853',
      },
    },
  },
  enUS,
);

export default lightTheme;
