import React, { FunctionComponent, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { saveAs } from 'file-saver';
import { Box, FormControl, MenuItem } from '@mui/material';
import usePreprocessor from '../../../hooks/usePreprocessor';
import Page from '../../../components/Page';
import MenuButton from '../../../components/MenuButton';
import {
  AutoFittingCanvas,
  FileContainer,
  Label,
} from '../../../components/forms/common';
import LSBGeneratorForm, {
  LSBGeneratorFormProps,
} from '../../../components/image/lsb/LSBGeneratorForm';
import { lsbWorker } from './lsbWorkerClient';

const formatToExt: Record<string, string> = {
  'image/png': 'png',
  'image/webp': 'webp',
};

const computeMinimumRequiredPixels = (
  payloadSize: number,
  bitsPerChannel: number,
  useAlphaChannel: boolean,
) => {
  const payloadBits = payloadSize * 8;
  const bitsPerPixel = bitsPerChannel * (useAlphaChannel ? 4 : 3);
  return Math.ceil(payloadBits / bitsPerPixel);
};

const computeWidthHeight = (
  size: number,
  aspectRatio: [number, number],
): [number, number] => {
  const [widthRatio, heightRatio] = aspectRatio;
  const widthHeight = Math.sqrt(size / (widthRatio * heightRatio));
  const theoreticalWidth = widthRatio * widthHeight;
  const theoreticalHeight = heightRatio * widthHeight;
  const ceiledWidth = Math.ceil(theoreticalWidth);
  const flooredHeight = Math.floor(theoreticalHeight);
  return [
    ceiledWidth,
    ceiledWidth * flooredHeight >= size ? flooredHeight : flooredHeight + 1,
  ];
};

const LSBGenerator: FunctionComponent = () => {
  const outputRef = useRef<HTMLCanvasElement | null>(null);
  const [hasOutput, setHasOutput] = useState(false);
  const { encrypt } = usePreprocessor();

  const handleChange = useDebouncedCallback<
    NonNullable<LSBGeneratorFormProps['onChange']>
  >(async data => {
    if (
      !outputRef.current ||
      !data.payload ||
      (data.encryption.algorithm !== 'none' && !data.encryption.password)
    ) {
      outputRef.current
        ?.getContext('bitmaprenderer')
        ?.transferFromImageBitmap(await createImageBitmap(new ImageData(1, 1)));
      setHasOutput(false);
      return;
    }
    const finalPayload =
      data.encryption.algorithm === 'none'
        ? data.payload
        : await encrypt(
            data.payload,
            data.encryption.password,
            data.encryption.algorithm,
          );
    const minimumRequiredPixels = computeMinimumRequiredPixels(
      finalPayload.length,
      data.bitsPerChannel,
      data.useAlphaChannel,
    );
    const [width, height] = computeWidthHeight(
      minimumRequiredPixels,
      data.aspectRatio,
    );
    const colorsArray = [
      data.backgroundColor.red,
      data.backgroundColor.green,
      data.backgroundColor.blue,
      Math.round((data.backgroundColor.alpha ?? 1) * 255),
    ];
    const outputImage = await lsbWorker.encode({
      inputImage: new ImageData(
        Uint8ClampedArray.from(
          { length: width * height * 4 },
          (_, index) => colorsArray[index % 4],
        ),
        width,
        height,
      ),
      message: Uint8ClampedArray.from(finalPayload),
      bitsPerChannel: data.bitsPerChannel,
      useAlphaChannel: data.useAlphaChannel,
    });
    const outputImageBitmap = await createImageBitmap(outputImage);
    outputRef.current.width = outputImageBitmap.width;
    outputRef.current.height = outputImageBitmap.height;
    outputRef.current
      .getContext('bitmaprenderer')
      ?.transferFromImageBitmap(outputImageBitmap);
    outputImageBitmap.close();
    setHasOutput(true);
  }, 300);

  const handleDownload = (format: string) => () => {
    if (!outputRef?.current) {
      return;
    }
    outputRef.current.toBlob(
      blob => {
        if (!blob) {
          return;
        }
        saveAs(blob, `output.${formatToExt[format]}`);
      },
      format,
      1,
    );
  };

  return (
    <Page size="md" title="Image - LSB - Generate">
      <LSBGeneratorForm onChange={handleChange} />
      <Box mt={3}>
        <FormControl fullWidth>
          <Label>Output image</Label>
          <FileContainer disabled height={320}>
            <AutoFittingCanvas pixelated hidden={!hasOutput} ref={outputRef} />
          </FileContainer>
        </FormControl>
        <Box mt={2} textAlign="right">
          <MenuButton
            variant="contained"
            color="secondary"
            disabled={!hasOutput}
            label="Download as"
          >
            <MenuItem onClick={handleDownload('image/png')}>PNG</MenuItem>
            <MenuItem onClick={handleDownload('image/webp')}>WEBP</MenuItem>
          </MenuButton>
        </Box>
      </Box>
    </Page>
  );
};

export default LSBGenerator;
