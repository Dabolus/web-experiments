import { createTheme, PaletteMode } from '@mui/material';
import { enUS } from '@mui/material/locale';

const createDefaultTheme = (mode?: PaletteMode) =>
  createTheme(
    {
      typography: {
        fontFamily: "'Jost', sans-serif",
        h3: {
          fontSize: '2rem',
          fontWeight: 800,
          margin: '1.2rem 0 0.6rem 0',
        },
        h4: {
          fontSize: '1.17rem',
          fontWeight: 700,
          margin: '1rem 0 0.5rem 0',
        },
        h5: {
          fontSize: '1.05rem',
          fontWeight: 600,
          margin: '0.8rem 0 0.4rem 0',
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
        background: {
          default: mode === 'dark' ? '#121212' : '#fff',
          paper: mode === 'dark' ? '#212121' : '#fff',
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
