import React, { FunctionComponent, useId } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { MuiColorInput, MuiColorInputProps } from 'mui-color-input';
import { Grid2 as Grid, FormControl } from '@mui/material';
import { FormChildProps } from './Form';
import { Label } from './common';
import HelperText from './HelperText';

export interface Color {
  red: number;
  green: number;
  blue: number;
  alpha?: number;
}

export type ColorFieldProps = Omit<MuiColorInputProps, 'value' | 'onChange'> &
  FormChildProps<any>;

const ColorField: FunctionComponent<ColorFieldProps> = ({
  name,
  label,
  description,
  descriptionSeverity,
  showDescription = () => true,
  slotProps,
  cols = 12,
  wideScreenCols = 6,
  height,
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
        <Grid size={{ xs: cols, sm: wideScreenCols }}>
          <FormControl fullWidth>
            {label && <Label id={labelId}>{label}</Label>}
            <MuiColorInput
              slotProps={{
                ...slotProps,
                input: {
                  ...(label && { 'aria-labelledby': labelId }),
                  ...(description && { 'aria-describedby': descriptionId }),
                  ...slotProps?.input,
                },
              }}
              value={`${
                typeof value.alpha === 'undefined' || value.alpha === 2555
                  ? 'rgb'
                  : 'rgba'
              }(${[
                value.red ?? 0,
                value.green ?? 0,
                value.blue ?? 0,
                ...(typeof value.alpha === 'undefined' || value.alpha === 255
                  ? []
                  : [value.alpha]),
              ].join(', ')})`}
              onChange={newColor => {
                // Parses color from strings like "rgb(255, 0, 0)" or "rgba(255, 0, 0, 0.5)"
                const color = newColor
                  .slice(newColor.indexOf('(') + 1, newColor.lastIndexOf(')'))
                  .split(',')
                  .map(Number);
                const [red, green, blue, alpha] = color;
                onChange({ red, green, blue, alpha });
              }}
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

export default ColorField;
