import { useEffect, useState } from 'react';
import { Theme } from '@mui/material';
import createDefaultTheme from '../themes/default';

export interface UseThemeValue {
  theme: Theme;
}

const initialThemeMode = window.matchMedia('(prefers-color-scheme: dark)')
  ?.matches
  ? 'dark'
  : 'light';

const useTheme = (): UseThemeValue => {
  const [theme, setTheme] = useState(createDefaultTheme(initialThemeMode));

  useEffect(() => {
    const listener = (e: MediaQueryListEvent) => {
      const themeMode = e.matches ? 'dark' : 'light';
      setTheme(createDefaultTheme(themeMode));
    };

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, []);

  return { theme };
};

export default useTheme;
