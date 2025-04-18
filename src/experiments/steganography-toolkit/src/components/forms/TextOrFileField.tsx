import React, { FunctionComponent, useId, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Grid2 as Grid,
  FormControl,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { FormChildProps } from './Form';
import FieldsStack, { FieldsStackProps } from './FieldsStack';
import Dropzone from 'react-dropzone';
import { prettifySize, readFile } from '../../helpers';
import {
  ClearFileButton,
  FileName,
  Label,
  FileContainer,
  FullHeightFormControl,
  InputContainer,
} from './common';
import type { FileFieldProps } from './FileField';

export interface TextOrFileFieldProps
  extends Omit<
    FormChildProps<any> & FieldsStackProps,
    'description' | 'children'
  > {
  spacing?: number;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  showLength?: boolean;
  accept?: FileFieldProps['accept'];
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const TextOrFileField: FunctionComponent<TextOrFileFieldProps> = ({
  name,
  label,
  spacing = 2,
  cols = 12,
  wideScreenCols = 6,
  height,
  required,
  disabled,
  maxLength,
  showLength,
  accept,
}) => {
  const { control } = useFormContext();
  const textLabelId = useId();
  const fileLabelId = useId();
  const [fileName, setFileName] = useState<string>('');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { name, value, onChange, disabled: _, ...field } }) => (
        <FieldsStack
          spacing={spacing}
          cols={cols}
          wideScreenCols={wideScreenCols}
          height={height}
        >
          <Grid size={12}>
            <FormControl fullWidth>
              {label && <Label id={textLabelId}>{label}</Label>}
              <OutlinedInput
                multiline
                rows={3.5}
                name={`${name}Text`}
                slotProps={{
                  input: {
                    'aria-labelledby': textLabelId,
                    maxLength,
                    ...field,
                  },
                }}
                value={fileName ? '' : decoder.decode(value)}
                onChange={event =>
                  onChange(
                    event.target.value.length > 0
                      ? encoder.encode(event.target.value)
                      : undefined,
                  )
                }
                required={required}
                disabled={disabled || !!fileName}
              />
              {showLength && !!value && !fileName && (
                <Typography
                  variant="caption"
                  position="absolute"
                  bottom={2}
                  left={6}
                >
                  {value.length ?? 0}
                  {maxLength && `/${maxLength}`}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid size={12}>
            <Dropzone
              multiple={false}
              disabled={disabled || (!!value && !fileName)}
              maxSize={maxLength}
              onDrop={async ([file]) => {
                const data = await readFile(file);
                setFileName(file.name);
                onChange?.(data);
              }}
              accept={accept}
            >
              {({ getRootProps, getInputProps, isDragActive }) => (
                <FullHeightFormControl fullWidth>
                  <InputContainer {...getRootProps()}>
                    <Label id={fileLabelId}>Or select a file instead</Label>
                    <input
                      {...getInputProps({
                        'aria-labelledby': fileLabelId,
                        name,
                        required,
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
                      {showLength && !!value && !!fileName && (
                        <Typography
                          variant="caption"
                          position="absolute"
                          bottom={2}
                          left={6}
                        >
                          {prettifySize(value.length)}
                          {maxLength && `/${prettifySize(maxLength)}`}
                        </Typography>
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
