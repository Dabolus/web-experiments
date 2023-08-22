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
} from '@mui/material';
import {
  FileCopy as FileCopyIcon,
  FileDownload as FileDownloadIcon,
  SimCardDownload as SimCardDownloadIcon,
} from '@mui/icons-material';
import Page from '../../Page';
import { setupWorkerClient } from '../../../workers/utils';
import type {
  DecodedTextResult,
  UnicodeWorker,
} from '../../../workers/text/unicode.worker';

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

const readFile = (file: File): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = reject;
    reader.onerror = reject;
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.readAsArrayBuffer(file);
  });

const UnicodeRevealer: FunctionComponent = () => {
  const [carrierWithPayload, setCarrierWithPayload] = useState('');
  const [payload, setPayload] = useState<DecodedTextResult | undefined>();
  const [copyToClipboardText, setCopyToClipboardText] =
    useState('Copy to clipboard');

  const [debouncedCarrierWithPayload] = useDebounce(carrierWithPayload, 300);

  useEffect(() => {
    const compute = async () => {
      if (!debouncedCarrierWithPayload) {
        setPayload(undefined);
        return;
      }

      const decoded = await unicodeWorker.decodeText(
        debouncedCarrierWithPayload,
      );

      setPayload(decoded);
    };

    compute();
  }, [debouncedCarrierWithPayload]);

  const handleDecodedOutputCopyToClipboard = async () => {
    await navigator.clipboard.writeText(payload!.hiddenText);
    setCopyToClipboardText('Copied!');
    setTimeout(() => setCopyToClipboardText('Copy to clipboard'), 2000);
  };

  const handleDecodedOutputDownloadAsTxt = () => {
    saveAs(
      new Blob([payload!.hiddenText], { type: 'text/plain' }),
      'output.txt',
    );
  };
  const handleDecodedOutputDownloadAsFile = async () => {
    const decoded = await unicodeWorker.decodeBinary(
      debouncedCarrierWithPayload,
    );

    saveAs(
      new Blob([decoded.hiddenData], { type: 'application/octet-stream' }),
      'output',
    );
  };

  return (
    <Page size="md">
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
              {payload?.hiddenText
                ? ` (length: ${payload.hiddenText.length})`
                : ''}
            </Label>
            <OutlinedInput
              readOnly
              multiline
              rows={8}
              value={payload?.hiddenText}
            />
          </FormControl>
          <Box mt={2} display="flex" justifyContent="space-between">
            <Box flex="1 1 auto">
              {payload && /[^ -~]/.test(payload?.hiddenText) && (
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
