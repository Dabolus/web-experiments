import React, { FunctionComponent, ReactNode, useId } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
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
  name,
  label,
  description,
  descriptionSeverity,
  showDescription = () => true,
  inputProps,
  cols = 12,
  wideScreenCols = 6,
  height,
  disabled,
  ...props
}) => {
  const { control } = useFormContext();
  const descriptionId = useId();

  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
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
