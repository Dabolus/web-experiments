import React, { FunctionComponent, useState, useEffect, useMemo } from 'react';
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
  Link,
  Select,
} from '@mui/material';
import {
  FileCopy as FileCopyIcon,
  FileDownload as FileDownloadIcon,
  SimCardDownload as SimCardDownloadIcon,
} from '@mui/icons-material';
import Page from '../../Page';
import { setupWorkerClient } from '../../../workers/utils';
import type {
  DecodedBinaryResult,
  UnicodeWorker,
} from '../../../workers/text/unicode.worker';
import { EncryptionAlgorithm } from '../../../workers/preprocessor.worker';
import usePreprocessor from '../../../hooks/usePreprocessor';

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

const DownloadLink = styled(Link)({
  marginTop: '-0.25rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 'inherit',
}) as typeof Link;

const decoder = new TextDecoder();

const UnicodeRevealer: FunctionComponent = () => {
  const [carrierWithPayload, setCarrierWithPayload] = useState('');
  const [payload, setPayload] = useState<DecodedBinaryResult | undefined>();
  const hiddenText = useMemo(
    () =>
      payload?.hiddenData ? decoder.decode(payload.hiddenData) : undefined,
    [payload],
  );
  const [copyToClipboardText, setCopyToClipboardText] =
    useState('Copy to clipboard');
  const [encryption, setEncryption] = useState<EncryptionAlgorithm | 'none'>(
    'none',
  );
  const [password, setPassword] = useState('');
  const { decrypt } = usePreprocessor();

  const [debouncedCarrierWithPayload] = useDebounce(carrierWithPayload, 300);

  useEffect(() => {
    const compute = async () => {
      if (
        !debouncedCarrierWithPayload ||
        (encryption !== 'none' && !password)
      ) {
        setPayload(undefined);
        return;
      }

      const decoded = await unicodeWorker.decodeBinary(
        debouncedCarrierWithPayload,
      );
      const hiddenData =
        encryption === 'none'
          ? decoded.hiddenData
          : await decrypt(decoded.hiddenData, password, encryption);

      setPayload({
        originalText: decoded.originalText,
        hiddenData,
      });
    };

    compute();
  }, [debouncedCarrierWithPayload, decrypt, encryption, password]);

  const handleDecodedOutputCopyToClipboard = async () => {
    await navigator.clipboard.writeText(hiddenText!);
    setCopyToClipboardText('Copied!');
    setTimeout(() => setCopyToClipboardText('Copy to clipboard'), 2000);
  };

  const handleDecodedOutputDownloadAsTxt = () => {
    saveAs(new Blob([hiddenText!], { type: 'text/plain' }), 'output.txt');
  };
  const handleDecodedOutputDownloadAsFile = async () => {
    const decoded = await unicodeWorker.decodeBinary(
      debouncedCarrierWithPayload,
    );
    const hiddenData =
      encryption === 'none'
        ? decoded.hiddenData
        : await decrypt(decoded.hiddenData, password, encryption);

    saveAs(
      new Blob([hiddenData], { type: 'application/octet-stream' }),
      'output',
    );
  };

  return (
    <Page size="md" title="Text - Unicode - Reveal">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <Label>
              Text with hidden message
              {carrierWithPayload
                ? ` (length: ${carrierWithPayload.length})`
                : ''}
            </Label>
            <OutlinedInput
              multiline
              rows={8}
              value={carrierWithPayload}
              onInput={event =>
                setCarrierWithPayload((event.target as HTMLInputElement).value)
              }
            />
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
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Label>
              Original text
              {payload?.originalText
                ? ` (length: ${payload.originalText.length})`
                : ''}
            </Label>
            <OutlinedInput
              readOnly
              multiline
              rows={8}
              value={payload?.originalText}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Label>
              Hidden text/file
              {payload?.hiddenData
                ? ` (length: ${payload.hiddenData.length})`
                : ''}
            </Label>
            <OutlinedInput readOnly multiline rows={8} value={hiddenText} />
          </FormControl>
          <Box mt={2} display="flex" justifyContent="space-between">
            <Box flex="1 1 auto">
              {hiddenText && /[^ -~]/.test(hiddenText) && (
                <>
                  Output looks weird?
                  <br />
                  Try{' '}
                  <DownloadLink
                    color="secondary"
                    component="button"
                    onClick={handleDecodedOutputDownloadAsFile}
                  >
                    downloading it as a file
                  </DownloadLink>{' '}
                  instead.
                </>
              )}
            </Box>
            <Box flex="0 0 auto">
              <Tooltip title={payload ? copyToClipboardText : ''}>
                <IconButton
                  onClick={handleDecodedOutputCopyToClipboard}
                  disabled={!payload}
                >
                  <FileCopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={payload ? 'Download as .txt' : ''}>
                <IconButton
                  onClick={handleDecodedOutputDownloadAsTxt}
                  disabled={!payload}
                >
                  <SimCardDownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={payload ? 'Download as file' : ''}>
                <IconButton
                  onClick={handleDecodedOutputDownloadAsFile}
                  disabled={!payload}
                >
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Page>
  );
};

export default UnicodeRevealer;
