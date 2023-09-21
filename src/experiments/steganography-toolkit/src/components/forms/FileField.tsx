import React, { FunctionComponent, PropsWithChildren, useId } from 'react';
import Dropzone, { DropzoneProps } from 'react-dropzone';
import { Controller } from 'react-hook-form';
import { Unstable_Grid2 as Grid, FormHelperText } from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { FormChildProps } from './Form';
import {
  ClearFileButton,
  FileName,
  Label,
  FileContainer,
  FullHeightFormControl,
  InputContainer,
} from './common';

export type FileFieldProps = PropsWithChildren<
  Omit<DropzoneProps & FormChildProps<any>, 'onDrop' | 'children'>
>;

const FileField: FunctionComponent<FileFieldProps> = ({
  control,
  name,
  label,
  description,
  cols = 12,
  wideScreenCols = 6,
  multiple = false,
  children,
  ...props
}) => {
  const labelId = useId();
  const descriptionId = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value = [], onChange, disabled, ...field } }) => (
        <Grid xs={cols} sm={wideScreenCols}>
          <Dropzone
            multiple={multiple}
            disabled={disabled}
            onDrop={files => onChange?.((multiple ? files : files[0]) as any)}
            {...props}
          >
            {({ getRootProps, getInputProps, isDragActive }) => (
              <FullHeightFormControl fullWidth>
                <InputContainer {...getRootProps()}>
                  {label && <Label id={labelId}>{label}</Label>}
                  <input
                    {...getInputProps({
                      ...(label && { 'aria-labelledby': labelId }),
                      ...(description && {
                        'aria-describedby': descriptionId,
                      }),
                      ...field,
                    })}
                  />
                  <FileContainer
                    disabled={disabled}
                    isDragActive={isDragActive}
                  >
                    {children}
                    {!children && (
                      <FileName hasFile={value instanceof File}>
                        {(Array.isArray(value) ? value : [value])
                          .map(file => file.name)
                          .join(', ') ||
                          'Drop a file here, or click to select file'}
                      </FileName>
                    )}
                    {value && (value instanceof File || value.length > 0) && (
                      <ClearFileButton
                        size="small"
                        aria-label="Clear file"
                        onClick={event => {
                          event.stopPropagation();
                          onChange?.(multiple ? [] : undefined);
                        }}
                      >
                        <ClearIcon />
                      </ClearFileButton>
                    )}
                  </FileContainer>
                </InputContainer>
                {description && (
                  <FormHelperText id={descriptionId}>
                    {description}
                  </FormHelperText>
                )}
              </FullHeightFormControl>
            )}
          </Dropzone>
        </Grid>
      )}
    />
  );
};

export default FileField;
