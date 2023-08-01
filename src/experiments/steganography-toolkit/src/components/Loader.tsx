import React, { FunctionComponent } from 'react';
import { CircularProgress, CircularProgressProps, styled } from '@mui/material';

export interface LoaderProps extends CircularProgressProps {
  size?: number;
}

const Container = styled('div')<{ size: number }>(({ size }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  marginTop: `-${size / 2}px`,
  marginLeft: `-${size / 2}px`,
}));

const Loader: FunctionComponent<LoaderProps> = ({ size = 32, ...props }) => (
  <Container size={size}>
    <CircularProgress size={size} {...props} />
  </Container>
);

export default Loader;
