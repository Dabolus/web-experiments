import React, { FunctionComponent } from 'react';
import { Theme, CircularProgress, CircularProgressProps } from '@mui/material';
import { makeStyles } from '@mui/styles';

export interface LoaderProps extends CircularProgressProps {
  size?: number;
}

const useStyles = makeStyles<Theme, { size: number }>(() => ({
  root: ({ size }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: `-${size / 2}px`,
    marginLeft: `-${size / 2}px`,
  }),
}));

const Loader: FunctionComponent<LoaderProps> = ({ size = 32, ...props }) => {
  const classes = useStyles({ size });

  return (
    <div className={classes.root}>
      <CircularProgress size={size} {...props} />
    </div>
  );
};

export default Loader;
