import React, { FunctionComponent, ReactNode, useId } from 'react';
import { Controller } from 'react-hook-form';
import {
  Unstable_Grid2 as Grid,
  FormControlLabel,
  CheckboxProps,
  Checkbox,
} from '@mui/material';
import { FormChildProps } from './Form';
import HelperText from './HelperText';

export type CheckboxFieldProps = CheckboxProps &
  FormChildProps<any> & {
    label: ReactNode;
  };

const CheckboxField: FunctionComponent<CheckboxFieldProps> = ({
  control,
  name,
  label,
  description,
  descriptionSeverity,
  showDescription = () => true,
  inputProps,
  cols = 12,
  wideScreenCols = 6,
  height,
  ...props
}) => {
  const descriptionId = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, disabled, ...field } }) => (
        <Grid xs={cols} sm={wideScreenCols}>
          <FormControlLabel
            label={label}
            disabled={disabled}
            control={<Checkbox checked={value} {...props} {...field} />}
          />
          {description && showDescription(value) && (
            <HelperText id={descriptionId} severity={descriptionSeverity}>
              {description}
            </HelperText>
          )}
        </Grid>
      )}
    />
  );
};

export default CheckboxField;
