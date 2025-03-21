import React, { FunctionComponent, useId } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Grid2 as Grid,
  FormControl,
  OutlinedInput,
  OutlinedInputProps,
  Typography,
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
    maxLength?: number;
    showLength?: boolean;
  };

const TextField: FunctionComponent<TextFieldProps> = ({
  name,
  label,
  description,
  descriptionSeverity,
  showDescription = () => true,
  type,
  slotProps,
  cols = 12,
  wideScreenCols = 6,
  height,
  min,
  max,
  step,
  disabled,
  maxLength,
  showLength,
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
        <Grid size={{ xs: cols, sm: wideScreenCols }}>
          <FormControl fullWidth>
            {label && <Label id={labelId}>{label}</Label>}
            <OutlinedInput
              type={type}
              slotProps={{
                ...slotProps,
                input: {
                  ...(label && { 'aria-labelledby': labelId }),
                  ...(description && { 'aria-describedby': descriptionId }),
                  min,
                  max,
                  step,
                  maxLength,
                  ...slotProps?.input,
                },
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
            {showLength && !!value && (
              <Typography
                variant="caption"
                position="absolute"
                bottom={2}
                left={6}
              >
                {value.length}
                {maxLength && `/${maxLength}`}
              </Typography>
            )}
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
