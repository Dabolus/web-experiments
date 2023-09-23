import React, { FunctionComponent, useRef, useState } from 'react';
import { Unstable_Grid2 as Grid, Button } from '@mui/material';
import { loadImage, readFile } from '../../../helpers';
import Form, { ChangeHandlerInfo, FormProps } from '../../forms/Form';
import FileField from '../../forms/FileField';
import TextField from '../../forms/TextField';
import SelectField from '../../forms/SelectField';
import CheckboxField from '../../forms/CheckboxField';

export interface SpectrogramGeneratorFormValue {
  image: HTMLCanvasElement | undefined;
  density: number;
  duration: number;
  sampleRate: number;
  minFrequency: number;
  maxFrequency: number;
  logarithmic: boolean;
}

type RawSpectrogramGeneratorFormValue = Omit<
  SpectrogramGeneratorFormValue,
  'image'
> & {
  image: File | undefined;
};

const defaultSpectrogramGeneratorFormValue: RawSpectrogramGeneratorFormValue = {
  image: undefined,
  density: 4,
  duration: 10,
  sampleRate: 44100,
  minFrequency: 0,
  maxFrequency: 22050, // sampleRate / 2
  logarithmic: false,
};

export interface SpectrogramGeneratorFormProps
  extends Omit<
    FormProps<SpectrogramGeneratorFormValue>,
    'defaultValue' | 'children'
  > {
  disabled?: boolean;
}

const SpectrogramGeneratorForm: FunctionComponent<
  SpectrogramGeneratorFormProps
> = ({ onChange, onSubmit, disabled, ...props }) => {
  const [latestFormValue, setLatestFormValue] =
    useState<SpectrogramGeneratorFormValue>(
      defaultSpectrogramGeneratorFormValue as unknown as SpectrogramGeneratorFormValue,
    );
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const transformRawValues = async (
    values: RawSpectrogramGeneratorFormValue,
  ): Promise<SpectrogramGeneratorFormValue> => {
    if (!values.image) {
      return values as SpectrogramGeneratorFormValue;
    }
    const imageContext = imageCanvasRef.current?.getContext('2d', {
      willReadFrequently: true,
    });
    if (!imageCanvasRef.current || !imageContext) {
      return { ...values, image: undefined };
    }
    const imageSrc = await readFile(values.image, 'dataURL');
    const imageImage = await loadImage(imageSrc);
    imageCanvasRef.current.width = imageImage.width;
    imageCanvasRef.current.height = imageImage.height;
    imageContext.drawImage(imageImage, 0, 0);
    return {
      ...values,
      image: imageCanvasRef.current,
    };
  };

  return (
    <Form<RawSpectrogramGeneratorFormValue>
      defaultValue={defaultSpectrogramGeneratorFormValue}
      onChange={async (values, info) => {
        const transformedValues = await transformRawValues(values);
        setLatestFormValue(transformedValues);
        onChange?.(transformedValues, info as ChangeHandlerInfo);
      }}
      onSubmit={async (values, event) => {
        const transformedValues = await transformRawValues(values);
        setLatestFormValue(transformedValues);
        onSubmit?.(transformedValues, event);
      }}
      {...props}
    >
      <canvas ref={imageCanvasRef} style={{ display: 'none' }} />
      <FileField
        required
        disabled={disabled}
        name="image"
        label="Image"
        accept={{
          'image/*': [
            '.png',
            '.gif',
            '.jpeg',
            '.jpg',
            '.bmp',
            '.webp',
            '.avif',
            '.svg',
          ],
        }}
      />
      <TextField
        required
        disabled={disabled}
        name="density"
        label="Density"
        type="number"
        min={1}
        max={10}
      />
      <TextField
        required
        disabled={disabled}
        name="duration"
        label="Duration (seconds, spectrogram width)"
        type="number"
        min={1}
        max={60}
      />
      <SelectField
        required
        disabled={disabled}
        name="sampleRate"
        label="Sample rate"
        options={[
          { name: '8 kHz', value: 8000 },
          { name: '11.025 kHz', value: 11025 },
          { name: '16 kHz', value: 16000 },
          { name: '22.05 kHz', value: 22050 },
          { name: '44.1 kHz', value: 44100 },
          { name: '48 kHz', value: 48000 },
          { name: '88.2 kHz', value: 88200 },
          { name: '96 kHz', value: 96000 },
          { name: '176.4 kHz', value: 176400 },
          { name: '192 kHz', value: 192000 },
          { name: '352.8 kHz', value: 352800 },
          { name: '384 kHz', value: 384000 },
        ]}
      />
      <TextField
        required
        disabled={disabled}
        name="minFrequency"
        label="Min frequency (hertz, spectrogram start height)"
        type="number"
        min={0}
        max={latestFormValue.maxFrequency - 50}
        step={50}
        description={[
          'Value is above the niquist frequency (half the sample rate).',
          'This will cause audio aliasing.',
        ]}
        descriptionSeverity="warning"
        showDescription={value => value > latestFormValue.sampleRate / 2}
      />
      <TextField
        required
        disabled={disabled}
        name="maxFrequency"
        label="Max frequency (hertz, spectrogram end height)"
        type="number"
        min={latestFormValue.minFrequency + 50}
        max={200000}
        step={50}
        description={[
          'Value is above the niquist frequency (half the sample rate).',
          'This will cause audio aliasing.',
        ]}
        descriptionSeverity="warning"
        showDescription={value => value > latestFormValue.sampleRate / 2}
      />
      <CheckboxField
        disabled={disabled}
        name="logarithmic"
        label="Use logarithmic scale"
        description="Output will look less precise"
        descriptionSeverity="warning"
        showDescription={value => value}
      />
    </Form>
  );
};

export default SpectrogramGeneratorForm;
