import React, { FunctionComponent, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, BoxProps, Breakpoint, styled } from '@mui/material';
import { logEvent } from '../firebase';

export interface PageProps extends BoxProps {
  title: string;
  size?: number | Breakpoint;
}

const Card = styled(Box)<PageProps>(({ theme, size = 'sm' }) => ({
  padding: '2rem 3rem',
  background: theme.palette.background.paper,
  width: '100%',
  maxWidth: typeof size === 'number' ? size : theme.breakpoints.values[size],
  margin: 0,
  flex: '1 1 auto',

  [theme.breakpoints.up('sm')]: {
    flex: '0 0 auto',
    margin: '0 auto',
    borderRadius: '.5rem',
    boxShadow:
      '0 .06rem .065rem 0 rgba(0, 0, 0, 0.14), 0 .003rem .15rem 0 rgba(0, 0, 0, 0.12), 0 .09rem .0035rem -.065rem rgba(0, 0, 0, 0.2)',
  },
}));

const Page: FunctionComponent<PageProps> = props => {
  const title = `Steganography Toolkit - ${props.title}`;

  useEffect(() => {
    logEvent('page_view', {
      page_title: title,
      page_location: window.location.href,
    });
  }, [title]);

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Card {...props} />
    </>
  );
};

export default Page;
