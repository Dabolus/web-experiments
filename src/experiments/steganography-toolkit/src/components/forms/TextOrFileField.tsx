import React, { FunctionComponent, useId, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  Unstable_Grid2 as Grid,
  FormControl,
  OutlinedInput,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { FormChildProps } from './Form';
import FieldsStack, { FieldsStackProps } from './FieldsStack';
import Dropzone from 'react-dropzone';
import { readFile } from '../../helpers';
import {
  ClearFileButton,
  FileName,
  Label,
  FileContainer,
  FullHeightFormControl,
  InputContainer,
} from './common';

export interface TextOrFileFieldProps
  extends Omit<
    FormChildProps<any> & FieldsStackProps,
    'description' | 'children'
  > {
  spacing?: number;
  disabled?: boolean;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const TextOrFileField: FunctionComponent<TextOrFileFieldProps> = ({
  control,
  name,
  label,
  spacing = 2,
  cols = 12,
  wideScreenCols = 6,
  height,
  disabled,
}) => {
  const textLabelId = useId();
  const fileLabelId = useId();
  const [fileName, setFileName] = useState<string>('');

  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      render={({ field: { name, value, onChange, disabled, ...field } }) => (
        <FieldsStack
          spacing={spacing}
          cols={cols}
          wideScreenCols={wideScreenCols}
          height={height}
        >
          <Grid xs={12}>
            <FormControl fullWidth>
              {label && <Label id={textLabelId}>{label}</Label>}
              <OutlinedInput
                multiline
                rows={3.5}
                name={`${name}Text`}
                inputProps={{ 'aria-labelledby': textLabelId, ...field }}
                value={fileName ? '' : decoder.decode(value)}
                onChange={event =>
                  onChange(
                    event.target.value.length > 0
                      ? encoder.encode(event.target.value)
                      : undefined,
                  )
                }
                disabled={disabled || !!fileName}
              />
            </FormControl>
          </Grid>
          <Grid xs={12}>
            <Dropzone
              multiple={false}
              disabled={disabled || (!!value && !fileName)}
              onDrop={async ([file]) => {
                const data = await readFile(file);
                setFileName(file.name);
                onChange?.(data);
              }}
            >
              {({ getRootProps, getInputProps, isDragActive }) => (
                <FullHeightFormControl fullWidth>
                  <InputContainer {...getRootProps()}>
                    <Label id={fileLabelId}>Or select a file instead</Label>
                    <input
                      {...getInputProps({
                        'aria-labelledby': fileLabelId,
                        name,
                        ...field,
                      })}
                    />
                    <FileContainer
                      disabled={disabled || (!!value && !fileName)}
                      isDragActive={isDragActive}
                    >
                      <FileName hasFile={!!fileName}>
                        {fileName ||
                          'Drop a file here, or click to select file'}
                      </FileName>
                      {fileName && (
                        <ClearFileButton
                          size="small"
                          aria-label="Clear file"
                          onClick={event => {
                            event.stopPropagation();
                            setFileName('');
                            onChange?.(undefined);
                          }}
                        >
                          <ClearIcon />
                        </ClearFileButton>
                      )}
                    </FileContainer>
                  </InputContainer>
                </FullHeightFormControl>
              )}
            </Dropzone>
          </Grid>
        </FieldsStack>
      )}
    />
  );
};

export default TextOrFileField;
