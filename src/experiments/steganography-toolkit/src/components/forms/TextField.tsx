import React, { FunctionComponent, useId } from 'react';
import { Controller } from 'react-hook-form';
import {
  Unstable_Grid2 as Grid,
  FormControl,
  FormHelperText,
  OutlinedInput,
  OutlinedInputProps,
} from '@mui/material';
import { FormChildProps } from './Form';
import { Label } from './common';

export type TextFieldProps = Omit<OutlinedInputProps, 'type'> &
  FormChildProps<any> & {
    type?: 'text' | 'number';
    min?: number;
    max?: number;
    step?: number;
  };

const TextField: FunctionComponent<TextFieldProps> = ({
  control,
  name,
  label,
  description,
  type,
  inputProps,
  cols = 12,
  wideScreenCols = 6,
  height,
  min,
  max,
  step,
  ...props
}) => {
  const labelId = useId();
  const descriptionId = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, ...field } }) => (
        <Grid xs={cols} sm={wideScreenCols}>
          <FormControl fullWidth>
            {label && <Label id={labelId}>{label}</Label>}
            <OutlinedInput
              type={type}
              inputProps={{
                ...(label && { 'aria-labelledby': labelId }),
                ...(description && { 'aria-describedby': descriptionId }),
                min,
                max,
                step,
                ...inputProps,
              }}
              onChange={event =>
                onChange(
                  type === 'number'
                    ? Number(event.target.value)
                    : event.target.value,
                )
              }
              sx={{ height }}
              {...props}
              {...field}
            />
            {description && (
              <FormHelperText id={descriptionId}>{description}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      )}
    />
  );
};

export default TextField;
