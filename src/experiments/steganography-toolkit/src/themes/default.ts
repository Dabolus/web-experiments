import { createTheme, PaletteMode, Theme } from '@mui/material';
import { enUS } from '@mui/material/locale';
// This is required to make the props of the components available to the
// theme. See https://mui.com/material-ui/about-the-lab/#typescript
import type * as _ from '@mui/lab/themeAugmentation';

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
        MuiCssBaseline: {
          styleOverrides: theme => `
            mark {
              background: ${theme.palette.secondary.dark};
              color: ${theme.palette.getContrastText(
                theme.palette.secondary.dark,
              )};
            }
            del {
              background: ${theme.palette.error.dark};
              color: ${theme.palette.getContrastText(theme.palette.error.dark)};
            }
            ins {
              background: ${theme.palette.secondary.dark};
              color: ${theme.palette.getContrastText(
                theme.palette.secondary.dark,
              )};
            }
          `,
        },
        MuiLink: {
          defaultProps: {
            underline: 'hover',
          },
        },
        MuiTabPanel: {
          styleOverrides: {
            root: ({ theme }: { theme: Theme }) => ({
              padding: 0,
              [theme.breakpoints.up('sm')]: {
                padding: theme.spacing(3),
              },
            }),
          },
        },
      },
    },
    enUS,
  );

export default createDefaultTheme;
