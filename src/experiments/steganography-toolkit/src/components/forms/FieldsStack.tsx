import React, { FunctionComponent, ReactElement } from 'react';
import { Grid2 as Grid } from '@mui/material';
import { FormChildProps } from './Form';

export interface FieldsStackProps {
  spacing?: number;
  cols?: number;
  wideScreenCols?: number;
  height?: number;
  children:
    | ReactElement<FormChildProps<any>>
    | ReactElement<FormChildProps<any>>[];
}

const FieldsStack: FunctionComponent<FieldsStackProps> = ({
  spacing = 2,
  cols = 12,
  wideScreenCols = 6,
  height,
  children,
}) => (
  <Grid size={{ xs: cols, sm: wideScreenCols }}>
    <div>
      <Grid container spacing={spacing} sx={{ height }}>
        {children}
      </Grid>
    </div>
  </Grid>
);

export default FieldsStack;
