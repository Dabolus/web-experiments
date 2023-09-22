import React, { FunctionComponent, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { saveAs } from 'file-saver';
import { Box, FormControl, MenuItem } from '@mui/material';
import usePreprocessor from '../../../hooks/usePreprocessor';
import Page from '../../Page';
import MenuButton from '../../MenuButton';
import { AutoFittingCanvas, FileContainer, Label } from '../../forms/common';
import LSBConcealerForm, { LSBConcealerFormProps } from './LSBConcealerForm';
import { lsbWorker } from './lsbWorkerClient';

const formatToExt: Record<string, string> = {
  'image/png': 'png',
  'image/webp': 'webp',
};

const LSBConcealer: FunctionComponent = () => {
  const outputRef = useRef<HTMLCanvasElement | null>(null);
  const [hasOutput, setHasOutput] = useState(false);
  const { encrypt } = usePreprocessor();

  const handleChange = useDebouncedCallback<
    NonNullable<LSBConcealerFormProps['onChange']>
  >(async data => {
    if (
      !outputRef.current ||
      !data.carrier ||
      !data.payload ||
      (data.encryption.algorithm !== 'none' && !data.encryption.password)
    ) {
      if (outputRef.current) {
        outputRef.current.width = data.carrier?.width ?? 0;
        outputRef.current.height = data.carrier?.height ?? 0;
      }
      const placeHolderImage =
        data.carrier
          ?.getContext('2d', {
            willReadFrequently: true,
          })
          ?.getImageData(0, 0, data.carrier.width, data.carrier.height) ??
        new ImageData(1, 1);
      outputRef.current
        ?.getContext('bitmaprenderer')
        ?.transferFromImageBitmap(await createImageBitmap(placeHolderImage));
      setHasOutput(!!data.carrier);
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
    const outputImage = await lsbWorker.encode({
      inputImage: data.carrier
        .getContext('2d', { willReadFrequently: true })!
        .getImageData(0, 0, data.carrier.width, data.carrier.height),
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
    <Page size="md" title="Image - LSB - Conceal">
      <LSBConcealerForm onChange={handleChange} />
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

export default LSBConcealer;
