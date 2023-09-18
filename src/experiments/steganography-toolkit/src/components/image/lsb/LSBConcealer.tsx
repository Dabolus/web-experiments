import React, {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useDropzone } from 'react-dropzone';
import { useDebounce } from 'use-debounce';
import { saveAs } from 'file-saver';
import {
  Box,
  Grid,
  FormControl,
  FormLabel,
  OutlinedInput,
  styled,
  Select,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import Page from '../../Page';
import { setupWorkerClient } from '../../../workers/utils';
import type { LSBWorker } from '../../../workers/image/lsb.worker';
import usePreprocessor from '../../../hooks/usePreprocessor';
import { EncryptionAlgorithm } from '../../../workers/preprocessor.worker';
import { loadImage, readFile } from '../../../helpers';
import FileContainer from '../../text/unicode/FileContainer';

const lsbWorker = setupWorkerClient<LSBWorker>(
  new Worker(new URL('../../../workers/image/lsb.worker.ts', import.meta.url), {
    type: 'module',
  }),
  ['encode'],
);

const Label = styled(FormLabel)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const LSBConcealer: FunctionComponent = () => {
  const [carrier, setCarrier] = useState<
    { name: string; content: string } | undefined
  >();
  const [payloadText, setPayloadText] = useState('');
  const [payloadFile, setPayloadFile] = useState<
    { name: string; content: Uint8Array } | undefined
  >();
  const [bitsPerChannel, setBitsPerChannel] = useState(1);
  const [useAlphaChannel, setUseAlphaChannel] = useState<boolean | 'auto'>(
    'auto',
  );
  const [encryption, setEncryption] = useState<EncryptionAlgorithm | 'none'>(
    'none',
  );
  const [password, setPassword] = useState('');
  const inputRef = useRef<HTMLCanvasElement | null>(null);
  const outputRef = useRef<HTMLCanvasElement | null>(null);
  const downloadButtonRef = useRef<HTMLButtonElement | null>(null);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const { encrypt } = usePreprocessor();

  const data = useMemo(
    () => ({ carrier, payloadText, payloadFile }),
    [carrier, payloadText, payloadFile],
  );

  const [debouncedData] = useDebounce(data, 300);

  const onCarrierFileDrop = useCallback(async ([acceptedFile]: File[]) => {
    const inputCtx = inputRef?.current?.getContext('2d', {
      willReadFrequently: true,
    });
    if (!inputCtx) {
      return;
    }
    const content = await readFile(acceptedFile, 'dataURL');
    const inputImage = await loadImage(content);
    inputCtx.canvas.width = inputImage.width;
    inputCtx.canvas.height = inputImage.height;
    inputCtx.drawImage(inputImage, 0, 0);
    setCarrier({ name: acceptedFile.name, content });
  }, []);

  const carrierDropzone = useDropzone({
    onDrop: onCarrierFileDrop,
  });

  const onPayloadFileDrop = useCallback(async ([acceptedFile]: File[]) => {
    const content = await readFile(acceptedFile);
    setPayloadFile({ name: acceptedFile.name, content });
  }, []);

  const payloadFileDropzone = useDropzone({
    onDrop: onPayloadFileDrop,
  });

  useEffect(() => {
    const compute = async () => {
      if (
        !inputRef?.current ||
        !outputRef?.current ||
        !debouncedData.carrier ||
        (encryption !== 'none' && !password) ||
        (!debouncedData.payloadText && !debouncedData.payloadFile)
      ) {
        if (inputRef?.current && outputRef?.current) {
          outputRef.current.width = inputRef.current.width;
          outputRef.current.height = inputRef.current.height;
        }
        const placeHolderImage =
          inputRef?.current
            ?.getContext('2d', {
              willReadFrequently: true,
            })
            ?.getImageData(
              0,
              0,
              inputRef.current.width,
              inputRef.current.height,
            ) ?? new ImageData(1, 1);
        outputRef?.current
          ?.getContext('bitmaprenderer')
          ?.transferFromImageBitmap(await createImageBitmap(placeHolderImage));
        return;
      }

      const dataToEncode = debouncedData.payloadText
        ? new TextEncoder().encode(debouncedData.payloadText)
        : debouncedData.payloadFile?.content;

      if (!dataToEncode) {
        return;
      }

      const finalDataToEncode =
        encryption === 'none'
          ? dataToEncode
          : await encrypt(dataToEncode, password, encryption);

      const outputImage = await lsbWorker.encode({
        inputImage: inputRef.current
          .getContext('2d', { willReadFrequently: true })!
          .getImageData(0, 0, inputRef.current.width, inputRef.current.height),
        message: Uint8ClampedArray.from(finalDataToEncode),
        bitsPerChannel,
        useAlphaChannel,
      });

      const outputImageBitmap = await createImageBitmap(outputImage);
      outputRef.current.width = outputImageBitmap.width;
      outputRef.current.height = outputImageBitmap.height;
      outputRef.current
        .getContext('bitmaprenderer')
        ?.transferFromImageBitmap(outputImageBitmap);
      outputImageBitmap.close();
    };

    compute();
  }, [
    debouncedData,
    encrypt,
    encryption,
    password,
    bitsPerChannel,
    useAlphaChannel,
  ]);

  const handleDownloadButtonClick = useCallback(async () => {
    setDownloadMenuOpen(true);
  }, []);

  const handleDownloadMenuClose = useCallback(() => {
    setDownloadMenuOpen(false);
  }, []);

  const handleDownload = useCallback(
    (format: string) => () => {
      if (!outputRef?.current) {
        return;
      }
      handleDownloadMenuClose();
      const formatToExt: Record<string, string> = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/webp': 'webp',
      };
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
    },
    [data],
  );

  return (
    <Page size="md" title="Image - LSB - Conceal">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={{ height: '100%' }}>
            <div
              {...carrierDropzone.getRootProps({ style: { height: '100%' } })}
            >
              <Label>Carrier image</Label>
              <input {...carrierDropzone.getInputProps()} />
              <FileContainer isDragActive={carrierDropzone.isDragActive}>
                <canvas
                  style={{
                    position: 'absolute',
                    top: 16.5,
                    left: 14,
                    width: 'calc(100% - 28px)',
                    height: 'calc(100% - 33px)',
                    objectFit: 'contain',
                  }}
                  ref={inputRef}
                />
                {!carrier && 'Drop an image here, or click to select image'}
              </FileContainer>
            </div>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Label>
                  Text to hide
                  {payloadText ? ` (length: ${payloadText.length})` : ''}
                </Label>
                <OutlinedInput
                  multiline
                  rows={3.5}
                  value={payloadText}
                  onInput={e =>
                    setPayloadText((e.target as HTMLInputElement).value)
                  }
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <div {...payloadFileDropzone.getRootProps()}>
                  <Label>Or select a file instead</Label>
                  <input {...payloadFileDropzone.getInputProps()} />
                  <FileContainer
                    isDragActive={payloadFileDropzone.isDragActive}
                  >
                    {payloadFile?.name ||
                      'Drop a file here, or click to select file'}
                  </FileContainer>
                </div>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Label>Bits per channel</Label>
            <Select
              native
              value={bitsPerChannel}
              onChange={e => setBitsPerChannel(Number(e.target.value))}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Label>Use alpha channel</Label>
            <Select
              native
              value={useAlphaChannel}
              onChange={e =>
                setUseAlphaChannel(
                  e.target.value === 'auto'
                    ? 'auto'
                    : e.target.value === 'true',
                )
              }
            >
              <option value="auto">Auto</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Label>Encryption</Label>
                <Select
                  native
                  value={encryption}
                  onChange={e =>
                    setEncryption(
                      e.target.value as EncryptionAlgorithm | 'none',
                    )
                  }
                >
                  <option value="none">None</option>
                  <option value="AES-CTR">AES (Counter)</option>
                  <option value="AES-GCM">AES (Galois/Counter)</option>
                  <option value="AES-CBC">AES (Cipher Block Chaining)</option>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Label>Password</Label>
                <OutlinedInput
                  type="password"
                  readOnly={encryption === 'none'}
                  value={encryption === 'none' ? '' : password}
                  onInput={e =>
                    setPassword((e.target as HTMLInputElement).value)
                  }
                  placeholder={
                    encryption === 'none'
                      ? 'Select an encryption algorithm first'
                      : ''
                  }
                />
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <Label>Output image</Label>
            <FileContainer disabled style={{ height: 320 }}>
              <canvas
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
                ref={outputRef}
              />
            </FileContainer>
          </FormControl>
          <Box mt={2} textAlign="right">
            <Button
              ref={downloadButtonRef}
              variant="contained"
              color="secondary"
              aria-controls="download-menu"
              aria-haspopup="true"
              endIcon={
                downloadMenuOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
              }
              onClick={handleDownloadButtonClick}
              disabled={!carrier || (!payloadText && !payloadFile)}
            >
              Download as
            </Button>
            <Menu
              id="download-menu"
              anchorEl={downloadButtonRef.current}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
              }}
              transformOrigin={{
                horizontal: 'right',
                vertical: 'top',
              }}
              keepMounted
              open={downloadMenuOpen}
              onClose={handleDownloadMenuClose}
            >
              <MenuItem onClick={handleDownload('image/png')}>PNG</MenuItem>
              <MenuItem onClick={handleDownload('image/jpeg')}>JPEG</MenuItem>
              <MenuItem onClick={handleDownload('image/webp')}>WEBP</MenuItem>
            </Menu>
          </Box>
        </Grid>
      </Grid>
    </Page>
  );
};

export default LSBConcealer;
