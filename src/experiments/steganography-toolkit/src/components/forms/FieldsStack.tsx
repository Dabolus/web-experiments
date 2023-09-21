import React, { FunctionComponent, ReactElement } from 'react';
import { Unstable_Grid2 as Grid } from '@mui/material';
import { FormChildProps } from './Form';

export interface FieldsStackProps {
  spacing?: number;
  cols?: number;
  wideScreenCols?: number;
  children:
    | ReactElement<FormChildProps<any>>
    | ReactElement<FormChildProps<any>>[];
}

const FieldsStack: FunctionComponent<FieldsStackProps> = ({
  spacing = 2,
  cols = 12,
  wideScreenCols = 6,
  children,
}) => (
  <Grid xs={cols} sm={wideScreenCols}>
    <div>
      <Grid container spacing={spacing}>
        {children}
      </Grid>
    </div>
  </Grid>
);

export default FieldsStack;
