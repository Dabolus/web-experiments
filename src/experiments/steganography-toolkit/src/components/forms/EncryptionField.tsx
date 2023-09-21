import React, { FunctionComponent, useId } from 'react';
import { Controller } from 'react-hook-form';
import {
  Unstable_Grid2 as Grid,
  FormControl,
  OutlinedInput,
  Select,
} from '@mui/material';
import { FormChildProps } from './Form';
import FieldsStack, { FieldsStackProps } from './FieldsStack';
import type { EncryptionAlgorithm } from '../../workers/preprocessor.worker';
import { Label } from './common';

export interface EncryptionFieldValue {
  algorithm: EncryptionAlgorithm | 'none';
  password: string;
}

export interface EncryptionFieldProps
  extends Omit<
    FormChildProps<any> & FieldsStackProps,
    'label' | 'description' | 'children'
  > {
  spacing?: number;
}

const EncryptionField: FunctionComponent<EncryptionFieldProps> = ({
  control,
  name,
  spacing = 3,
  cols = 12,
  wideScreenCols = 12,
  height,
}) => {
  const algorithmLabelId = useId();
  const passwordLabelId = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: {
          name,
          value: { algorithm = 'none', password = '' } = {},
          onChange,
          ...field
        },
      }) => {
        return (
          <FieldsStack
            spacing={spacing}
            cols={cols}
            wideScreenCols={wideScreenCols}
          >
            <Grid xs={12} sm={6}>
              <FormControl fullWidth>
                <Label id={algorithmLabelId}>Encryption</Label>
                <Select
                  native
                  name={`${name}Algorithm`}
                  aria-labelledby={algorithmLabelId}
                  value={algorithm || 'none'}
                  onChange={event =>
                    onChange({
                      algorithm: event.target.value,
                      password,
                    })
                  }
                  sx={{ height }}
                  {...field}
                >
                  <option value="none">None</option>
                  <option value="AES-CTR">AES (Counter)</option>
                  <option value="AES-GCM">AES (Galois/Counter)</option>
                  <option value="AES-CBC">AES (Cipher Block Chaining)</option>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl fullWidth>
                <Label>Password</Label>
                <OutlinedInput
                  type="password"
                  name={`${name}Password`}
                  readOnly={algorithm === 'none'}
                  value={algorithm === 'none' ? '' : password}
                  inputProps={{ 'aria-labelledby': passwordLabelId }}
                  onChange={event =>
                    onChange({
                      algorithm,
                      password: event.target.value,
                    })
                  }
                  placeholder={
                    algorithm === 'none'
                      ? 'Select an encryption algorithm first'
                      : ''
                  }
                  sx={{ height }}
                  {...field}
                />
              </FormControl>
            </Grid>
          </FieldsStack>
        );
      }}
    />
  );
};

export default EncryptionField;
