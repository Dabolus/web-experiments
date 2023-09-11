import React, { FunctionComponent, HTMLAttributes, ReactNode } from 'react';
import { LinearProgress, Typography, styled, alpha } from '@mui/material';

export interface LoadingOverlayProps extends HTMLAttributes<HTMLDivElement> {
  status?: ReactNode;
  progress?: number;
  zIndex?: number;
}

const percentFormatter = new Intl.NumberFormat(undefined, {
  style: 'percent',
  maximumFractionDigits: 0,
});

const Container = styled('div')<{ zIndex?: number }>(({ theme, zIndex }) => ({
  zIndex,
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  backgroundColor: alpha(theme.palette.background.paper, 0.87),
}));

const LoadingOverlay: FunctionComponent<LoadingOverlayProps> = ({
  status,
  progress,
  zIndex,
  ...props
}) => {
  const isDeterminate = progress !== undefined;
  return (
    <Container zIndex={zIndex} {...props}>
      {typeof status === 'string' ? <Typography>{status}</Typography> : status}
      <LinearProgress
        variant={isDeterminate ? 'determinate' : 'indeterminate'}
        sx={{ width: 320, maxWidth: '100%' }}
        value={isDeterminate ? progress * 100 : undefined}
      />
      {isDeterminate && (
        <Typography>{percentFormatter.format(progress)}</Typography>
      )}
    </Container>
  );
};
export default LoadingOverlay;
