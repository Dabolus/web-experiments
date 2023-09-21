import React, { FunctionComponent, useId } from 'react';
import { Controller, Primitive } from 'react-hook-form';
import {
  Unstable_Grid2 as Grid,
  FormControl,
  FormHelperText,
  Select,
  SelectProps,
} from '@mui/material';
import { FormChildProps } from './Form';
import { Label } from './common';

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
  control,
  name,
  label,
  description,
  inputProps,
  cols = 12,
  wideScreenCols = 6,
  options,
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
            <Select
              native
              {...(label && { 'aria-labelledby': labelId })}
              {...(description && { 'aria-describedby': descriptionId })}
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
            {description && (
              <FormHelperText id={descriptionId}>{description}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      )}
    />
  );
};

export default SelectField;
