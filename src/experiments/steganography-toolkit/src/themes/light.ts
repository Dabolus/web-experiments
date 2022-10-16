import { createMuiTheme } from '@material-ui/core';

import { enUS } from '@material-ui/core/locale';

const lightTheme = createMuiTheme(
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
