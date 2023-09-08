import React, {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
  useMemo,
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
  IconButton,
  Tooltip,
  Select,
} from '@mui/material';
import {
  FileCopy as FileCopyIcon,
  SimCardDownload as SimCardDownloadIcon,
} from '@mui/icons-material';
import Page from '../../Page';
import { setupWorkerClient } from '../../../workers/utils';
import type { UnicodeWorker } from '../../../workers/text/unicode.worker';
import usePreprocessor from '../../../hooks/usePreprocessor';
import { EncryptionAlgorithm } from '../../../workers/preprocessor.worker';
import { readFile } from '../../../helpers';
import FileContainer from './FileContainer';

const unicodeWorker = setupWorkerClient<UnicodeWorker>(
  new Worker(
    new URL('../../../workers/text/unicode.worker.ts', import.meta.url),
    {
      type: 'module',
    },
  ),
  ['encodeText', 'encodeBinary', 'decodeText', 'decodeBinary'],
);

const Label = styled(FormLabel)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const UnicodeConcealer: FunctionComponent = () => {
  const [carrier, setCarrier] = useState('');
  const [payloadText, setPayloadText] = useState('');
  const [payloadFile, setPayloadFile] = useState<
    { name: string; content: Uint8Array } | undefined
  >();
  const [output, setOutput] = useState('');
  const [copyToClipboardText, setCopyToClipboardText] =
    useState('Copy to clipboard');
  const [encryption, setEncryption] = useState<EncryptionAlgorithm | 'none'>(
    'none',
  );
  const [password, setPassword] = useState('');
  const { encrypt } = usePreprocessor();

  const data = useMemo(
    () => ({ carrier, payloadText, payloadFile }),
    [carrier, payloadText, payloadFile],
  );

  const [debouncedData] = useDebounce(data, 300);

  const onFileDrop = useCallback(async ([acceptedFile]: File[]) => {
    const content = await readFile(acceptedFile);
    setPayloadFile({ name: acceptedFile.name, content });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFileDrop,
  });

  useEffect(() => {
    const compute = async () => {
      if (
        !debouncedData.carrier ||
        (encryption !== 'none' && !password) ||
        (!debouncedData.payloadText && !debouncedData.payloadFile)
      ) {
        setOutput('');
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

      const encodedText = await unicodeWorker.encodeBinary(
        debouncedData.carrier,
        finalDataToEncode,
      );

      setOutput(encodedText);
    };

    compute();
  }, [debouncedData, encrypt, encryption, password]);

  const handleEncodedOutputCopyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopyToClipboardText('Copied!');
    setTimeout(() => setCopyToClipboardText('Copy to clipboard'), 2000);
  };

  const handleEncodedOutputDownload = () => {
    saveAs(new Blob([output], { type: 'text/plain' }), 'output.txt');
  };

  return (
    <Page size="md" title="Text - Unicode - Conceal">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Label>
              Text in which to hide the message
              {carrier ? ` (length: ${carrier.length})` : ''}
            </Label>
            <OutlinedInput
              multiline
              rows={8}
              value={carrier}
              onInput={e => setCarrier((e.target as HTMLInputElement).value)}
            />
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
                <div {...getRootProps()}>
                  <Label>
                    Or select a file instead
                    {payloadFile
                      ? ` (size: ${payloadFile.content.length}B)`
                      : ''}
                  </Label>
                  <input {...getInputProps()} />
                  <FileContainer isDragActive={isDragActive}>
                    {payloadFile?.name ||
                      'Drop a file here, or click to select file'}
                  </FileContainer>
                </div>
              </FormControl>
            </Grid>
          </Grid>
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
            <Label>
              Output text
              {output
                ? ` (length: ${output.length}, +${Math.round(
                    (output.length / carrier.length) * 100 - 100,
                  )}%)`
                : ''}
            </Label>
            <OutlinedInput readOnly multiline rows={8} value={output} />
          </FormControl>
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Tooltip title={output ? copyToClipboardText : ''}>
              <IconButton
                onClick={handleEncodedOutputCopyToClipboard}
                disabled={!output}
              >
                <FileCopyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={output ? 'Download as .txt' : ''}>
              <IconButton
                onClick={handleEncodedOutputDownload}
                disabled={!output}
              >
                <SimCardDownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
    </Page>
  );
};

export default UnicodeConcealer;
