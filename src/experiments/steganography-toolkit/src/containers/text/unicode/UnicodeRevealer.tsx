import React, { FunctionComponent, useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { saveAs } from 'file-saver';
import {
  Unstable_Grid2 as Grid,
  Box,
  FormControl,
  OutlinedInput,
  IconButton,
  Tooltip,
  Typography,
  styled,
  Link,
} from '@mui/material';
import {
  FileCopy as FileCopyIcon,
  FileDownload as FileDownloadIcon,
  SimCardDownload as SimCardDownloadIcon,
} from '@mui/icons-material';
import usePreprocessor from '../../../hooks/usePreprocessor';
import { prettifySize } from '../../../helpers';
import Page from '../../../components/Page';
import { Label } from '../../../components/forms/common';
import UnicodeRevealerForm, {
  UnicodeRevealerFormProps,
} from '../../../components/text/unicode/UnicodeRevealerForm';
import { unicodeWorkerClient } from './unicodeWorkerClient';
import type { DecodedBinaryResult } from '../../../workers/text/unicode.worker';

const DownloadLink = styled(Link)({
  marginTop: '-0.25rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 'inherit',
}) as typeof Link;

const decoder = new TextDecoder();

const UnicodeRevealer: FunctionComponent = () => {
  const [carrierWithPayloadLength, setCarrierWithPayloadLength] = useState(0);
  const [output, setOutput] = useState<DecodedBinaryResult | undefined>();
  const hiddenText = useMemo(
    () => (output?.hiddenData ? decoder.decode(output.hiddenData) : ''),
    [output],
  );
  const [copyToClipboardText, setCopyToClipboardText] =
    useState('Copy to clipboard');
  const { decrypt } = usePreprocessor();

  const handleChange = useDebouncedCallback<
    NonNullable<UnicodeRevealerFormProps['onChange']>
  >(async data => {
    setCarrierWithPayloadLength(data.carrierWithPayload?.length ?? 0);

    if (
      !data.carrierWithPayload ||
      (data.encryption.algorithm !== 'none' && !data.encryption.password)
    ) {
      setOutput(undefined);
      return;
    }

    const decoded = await unicodeWorkerClient.decodeBinary(
      decoder.decode(data.carrierWithPayload),
    );

    const hiddenData =
      data.encryption.algorithm === 'none'
        ? decoded.hiddenData
        : await decrypt(
            decoded.hiddenData,
            data.encryption.password,
            data.encryption.algorithm,
          );

    setOutput({
      originalText: decoded.originalText,
      hiddenData,
    });
  }, 300);

  const handleDecodedOutputCopyToClipboard = async () => {
    await navigator.clipboard.writeText(hiddenText);
    setCopyToClipboardText('Copied!');
    setTimeout(() => setCopyToClipboardText('Copy to clipboard'), 2000);
  };

  const handleDecodedOutputDownloadAsTxt = () => {
    saveAs(new Blob([hiddenText], { type: 'text/plain' }), 'output.txt');
  };

  const handleDecodedOutputDownloadAsFile = async () => {
    saveAs(
      new Blob([output!.hiddenData], { type: 'application/octet-stream' }),
      'output',
    );
  };

  return (
    <Page size="md" title="Text - Unicode - Reveal">
      <UnicodeRevealerForm onChange={handleChange} />
      <Grid container spacing={3} mt={2}>
        <Grid xs={12} sm={6}>
          <FormControl fullWidth>
            <Label>Original text</Label>
            <OutlinedInput
              readOnly
              multiline
              rows={8}
              value={output?.originalText}
            />
            {output && (
              <Typography
                variant="caption"
                position="absolute"
                bottom={2}
                left={6}
              >
                {output.originalText.length}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid xs={12} sm={6}>
          <FormControl fullWidth>
            <Label>Hidden text/file</Label>
            <OutlinedInput readOnly multiline rows={8} value={hiddenText} />
            {output && (
              <Typography
                variant="caption"
                position="absolute"
                bottom={2}
                left={6}
              >
                {prettifySize(output.hiddenData.length)}
              </Typography>
            )}
          </FormControl>
          <Box mt={2} display="flex" justifyContent="space-between">
            <Box flex="1 1 auto">
              {/[^ -~]/.test(hiddenText) && (
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
              <Tooltip title={output ? copyToClipboardText : ''}>
                <IconButton
                  onClick={handleDecodedOutputCopyToClipboard}
                  disabled={!output}
                >
                  <FileCopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={output ? 'Download as .txt' : ''}>
                <IconButton
                  onClick={handleDecodedOutputDownloadAsTxt}
                  disabled={!output}
                >
                  <SimCardDownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={output ? 'Download as file' : ''}>
                <IconButton
                  onClick={handleDecodedOutputDownloadAsFile}
                  disabled={!output}
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
