import React, { FunctionComponent } from 'react';
import { CircularProgress, CircularProgressProps, styled } from '@mui/material';

export interface LoaderProps extends CircularProgressProps {
  size?: number;
  zIndex?: number;
}

const Container = styled('div')<{ size: number; zIndex?: number }>(
  ({ size, zIndex }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: `-${size / 2}px`,
    marginLeft: `-${size / 2}px`,
    zIndex,
  }),
);

const Loader: FunctionComponent<LoaderProps> = ({
  size = 32,
  zIndex,
  ...props
}) => (
  <Container size={size} zIndex={zIndex}>
    <CircularProgress size={size} {...props} />
  </Container>
);

export default Loader;
