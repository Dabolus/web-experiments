import React, { FunctionComponent, useId } from 'react';
import { Controller, Primitive, useFormContext } from 'react-hook-form';
import { Grid2 as Grid, FormControl, Select, SelectProps } from '@mui/material';
import { FormChildProps } from './Form';
import { Label } from './common';
import HelperText from './HelperText';

type SimpleSelectOption = Primitive;

type ComplexSelectOption = { name?: string; value: SimpleSelectOption };

type SelectOption = SimpleSelectOption | ComplexSelectOption;

export type SelectFieldProps = Omit<SelectProps, 'native'> &
  FormChildProps<any> & {
    options: SelectOption[];
  };

const isComplexOption = (option: SelectOption): option is ComplexSelectOption =>
  typeof option === 'object' && option !== null && 'value' in option;

const SelectField: FunctionComponent<SelectFieldProps> = ({
  name,
  label,
  description,
  descriptionSeverity,
  showDescription = () => true,
  cols = 12,
  wideScreenCols = 6,
  height,
  options,
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
            <Select
              native
              {...(label && { 'aria-labelledby': labelId })}
              {...(description && { 'aria-describedby': descriptionId })}
              value={value}
              onChange={event => {
                const selectedOption = options.find(option =>
                  isComplexOption(option)
                    ? String(option.value) === event.target.value
                    : String(option) === event.target.value,
                );
                const selectedValue =
                  selectedOption && isComplexOption(selectedOption)
                    ? selectedOption.value
                    : selectedOption;
                onChange(selectedValue);
              }}
              sx={{ height }}
              disabled={disabled}
              {...props}
              {...field}
            >
              {options.map(option =>
                isComplexOption(option) ? (
                  <option
                    key={String(option.value)}
                    value={String(option.value)}
                  >
                    {option.name || String(option.value)}
                  </option>
                ) : (
                  <option key={String(option)} value={String(option)}>
                    {String(option)}
                  </option>
                ),
              )}
            </Select>
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

export default SelectField;
