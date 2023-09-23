import React, { FunctionComponent, PropsWithChildren, useId } from 'react';
import Dropzone, { DropzoneProps } from 'react-dropzone';
import { Controller } from 'react-hook-form';
import { Unstable_Grid2 as Grid, styled } from '@mui/material';
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
import HelperText from './HelperText';

export type FileFieldProps = PropsWithChildren<
  Omit<DropzoneProps & FormChildProps<any>, 'onDrop' | 'children'>
> & {
  required?: boolean;
};

const HiddenInput = styled('input')({
  display: 'block !important',
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
});

const FileField: FunctionComponent<FileFieldProps> = ({
  control,
  name,
  label,
  description,
  descriptionSeverity,
  showDescription = () => true,
  cols = 12,
  wideScreenCols = 6,
  height,
  multiple = false,
  required,
  children,
  disabled,
  ...props
}) => {
  const labelId = useId();
  const descriptionId = useId();

  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      render={({
        field: { value = [], onChange, disabled, ref: _, ...field },
      }) => (
        <Grid xs={cols} sm={wideScreenCols}>
          <Dropzone
            multiple={multiple}
            disabled={disabled}
            onDrop={(files, _rejections, event) => {
              const dataTransfer = new DataTransfer();
              files.forEach(file => {
                dataTransfer.items.add(file);
              });

              const input = event.target as HTMLInputElement;
              input.files = dataTransfer.files;
              // Help Safari out
              if (input.webkitEntries.length) {
                input.dataset.file = `${dataTransfer.files[0].name}`;
              }

              onChange?.((multiple ? files : files[0]) as any);
            }}
            {...props}
          >
            {({ getRootProps, getInputProps, isDragActive, inputRef }) => (
              <FullHeightFormControl fullWidth>
                <InputContainer {...getRootProps()}>
                  {label && <Label id={labelId}>{label}</Label>}
                  <FileContainer
                    disabled={disabled}
                    isDragActive={isDragActive}
                    height={height}
                  >
                    <HiddenInput
                      {...getInputProps({
                        ...(label && { 'aria-labelledby': labelId }),
                        ...(description && {
                          'aria-describedby': descriptionId,
                        }),
                        onChange,
                        required,
                        ...field,
                      })}
                    />
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
                          if (inputRef.current) {
                            inputRef.current.value = '';
                          }
                          onChange?.(multiple ? [] : undefined);
                        }}
                      >
                        <ClearIcon />
                      </ClearFileButton>
                    )}
                  </FileContainer>
                </InputContainer>
                {description && showDescription(value) && (
                  <HelperText id={descriptionId} severity={descriptionSeverity}>
                    {description}
                  </HelperText>
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
