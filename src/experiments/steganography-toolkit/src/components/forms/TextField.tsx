import React, { FunctionComponent, useId } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Unstable_Grid2 as Grid,
  FormControl,
  OutlinedInput,
  OutlinedInputProps,
} from '@mui/material';
import { FormChildProps } from './Form';
import { Label } from './common';
import HelperText from './HelperText';

export type TextFieldProps = Omit<OutlinedInputProps, 'type'> &
  FormChildProps<any> & {
    type?: 'text' | 'number';
    min?: number;
    max?: number;
    step?: number;
  };

const TextField: FunctionComponent<TextFieldProps> = ({
  name,
  label,
  description,
  descriptionSeverity,
  showDescription = () => true,
  type,
  inputProps,
  cols = 12,
  wideScreenCols = 6,
  height,
  min,
  max,
  step,
  disabled,
  ...props
}) => {
  const { control } = useFormContext();
  const labelId = useId();
  const descriptionId = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, disabled: _, ...field } }) => (
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
              value={value}
              onChange={event =>
                onChange(
                  type === 'number'
                    ? Number(event.target.value)
                    : event.target.value,
                )
              }
              sx={{ height }}
              disabled={disabled}
              {...props}
              {...field}
            />
            {description && showDescription(value) && (
              <HelperText id={descriptionId} severity={descriptionSeverity}>
                {description}
              </HelperText>
            )}
          </FormControl>
        </Grid>
      )}
    />
  );
};

export default TextField;
