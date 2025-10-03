import React, { FunctionComponent, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { saveAs } from 'file-saver';
import {
  Box,
  FormControl,
  IconButton,
  Link,
  OutlinedInput,
  Tooltip,
  styled,
} from '@mui/material';
import {
  FileCopy as FileCopyIcon,
  SimCardDownload as SimCardDownloadIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import usePreprocessor from '../../../hooks/usePreprocessor';
import Page from '../../../components/Page';
import { Label } from '../../../components/forms/common';
import PVDRevealerForm, {
  PVDRevealerFormProps,
} from '../../../components/image/pvd/PVDRevealerForm';
import { pvdWorkerClient } from './pvdWorkerClient';

const DownloadLink = styled(Link)({
  marginTop: '-0.25rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 'inherit',
}) as typeof Link;

const decoder = new TextDecoder();

const PVDRevealer: FunctionComponent = () => {
  const [copyToClipboardText, setCopyToClipboardText] =
    useState('Copy to clipboard');
  const [output, setOutput] = useState<Uint8Array | undefined>(undefined);
  const outputText = output && decoder.decode(output);
  const { decrypt } = usePreprocessor();

  const handleChange = useDebouncedCallback<
    NonNullable<PVDRevealerFormProps['onChange']>
  >(async data => {
    if (
      !data.carrierWithPayload ||
      (data.encryption.algorithm !== 'none' && !data.encryption.password)
    ) {
      setOutput(undefined);
      return;
    }
    const payload = Uint8Array.from(
      await pvdWorkerClient.decode({
        imageWithMessage: data.carrierWithPayload
          .getContext('2d', { willReadFrequently: true })!
          .getImageData(
            0,
            0,
            data.carrierWithPayload.width,
            data.carrierWithPayload.height,
          ),
        bitsPerChannel: data.bitsPerChannel,
        useAlphaChannel: data.useAlphaChannel,
      }),
    );
    const finalPayload =
      data.encryption.algorithm === 'none'
        ? payload
        : await decrypt(
            payload,
            data.encryption.password,
            data.encryption.algorithm,
          );
    setOutput(finalPayload);
  }, 300);

  const handleDecodedOutputCopyToClipboard = async () => {
    await navigator.clipboard.writeText(outputText!);
    setCopyToClipboardText('Copied!');
    setTimeout(() => setCopyToClipboardText('Copy to clipboard'), 2000);
  };

  const handleDecodedOutputDownloadAsTxt = () => {
    saveAs(new Blob([outputText!], { type: 'text/plain' }), 'output.txt');
  };

  const handleDecodedOutputDownloadAsFile = async () => {
    saveAs(new Blob([output!], { type: 'application/octet-stream' }), 'output');
  };

  return (
    <Page size="md" title="Image - PVD - Reveal">
      <PVDRevealerForm onChange={handleChange} />
      <Box mt={3}>
        <FormControl fullWidth>
          <Label>Hidden text/file</Label>
          <OutlinedInput
            readOnly
            multiline
            rows={8}
            value={`${outputText?.slice(0, 2048) ?? ''}${
              outputText && outputText.length > 2048 ? '\n…' : ''
            }`}
          />
        </FormControl>
        <Box mt={2} display="flex" justifyContent="space-between">
          <Box flex="1 1 auto">
            {outputText && /[^ -~]/.test(outputText) && (
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
      </Box>
    </Page>
  );
};

export default PVDRevealer;
