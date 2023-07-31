import { createTheme, Theme, PaletteMode } from '@mui/material';

import { enUS } from '@mui/material/locale';

declare module '@mui/styles' {
  interface DefaultTheme extends Theme {}
}

const createDefaultTheme = (mode?: PaletteMode) =>
  createTheme(
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
        mode,
        primary: {
          main: mode === 'dark' ? '#00c853' : '#212121',
        },
        secondary: {
          main: '#00c853',
        },
      },
      components: {
        MuiLink: {
          defaultProps: {
            underline: 'hover',
          },
        },
      },
    },
    enUS,
  );

export default createDefaultTheme;
