import React, { FunctionComponent, PropsWithChildren } from 'react';
import { Box, BoxProps, Theme, Breakpoint, styled } from '@mui/material';

export interface PageProps extends BoxProps {
  size?: number | Breakpoint;
}

const Page = styled(Box)<PageProps>(({ theme, size = 'sm' }) => ({
  padding: '2rem 3rem',
  background: theme.palette.background.paper,
  width: '100%',
  maxWidth: typeof size === 'number' ? size : theme.breakpoints.values[size],
  margin: 0,
  flex: '1 1 auto',

  [theme.breakpoints.up('md')]: {
    flex: '0 0 auto',
    margin: `${theme.spacing(3)} auto`,
    borderRadius: '.5rem',
    boxShadow:
      '0 .06rem .065rem 0 rgba(0, 0, 0, 0.14), 0 .003rem .15rem 0 rgba(0, 0, 0, 0.12), 0 .09rem .0035rem -.065rem rgba(0, 0, 0, 0.2)',
  },
}));

export default Page;
