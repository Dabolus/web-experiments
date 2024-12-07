import React, { FunctionComponent, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { saveAs } from 'file-saver';
import {
  Box,
  FormControl,
  OutlinedInput,
  IconButton,
  Tooltip,
  Stack,
  Typography,
} from '@mui/material';
import {
  FileCopy as FileCopyIcon,
  SimCardDownload as SimCardDownloadIcon,
} from '@mui/icons-material';
import usePreprocessor from '../../../hooks/usePreprocessor';
import { prettifySize } from '../../../helpers';
import Page from '../../../components/Page';
import { Label } from '../../../components/forms/common';
import UnicodeConcealerForm, {
  UnicodeConcealerFormProps,
} from '../../../components/text/unicode/UnicodeConcealerForm';
import { unicodeWorkerClient } from './unicodeWorkerClient';

const UnicodeConcealer: FunctionComponent = () => {
  const [carrierLength, setCarrierLength] = useState(0);
  const [output, setOutput] = useState('');
  const [copyToClipboardText, setCopyToClipboardText] =
    useState('Copy to clipboard');
  const { encrypt } = usePreprocessor();

  const handleChange = useDebouncedCallback<
    NonNullable<UnicodeConcealerFormProps['onChange']>
  >(async data => {
    setCarrierLength(data.carrier.length);

    if (
      !data.carrier ||
      (data.encryption.algorithm !== 'none' && !data.encryption.password) ||
      !data.payload
    ) {
      setOutput('');
      return;
    }

    const finalDataToEncode =
      data.encryption.algorithm === 'none'
        ? data.payload
        : await encrypt(
            data.payload,
            data.encryption.password,
            data.encryption.algorithm,
          );

    const encodedText = await unicodeWorkerClient.encodeBinary(
      data.carrier,
      finalDataToEncode,
    );

    setOutput(encodedText);
  }, 300);

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
      <UnicodeConcealerForm onChange={handleChange} />
      <Box mt={3}>
        <FormControl fullWidth>
          <Label>Output text</Label>
          <OutlinedInput readOnly multiline rows={8} value={output} />
          {output && (
            <Typography
              variant="caption"
              position="absolute"
              bottom={2}
              left={6}
            >
              {`${prettifySize(output.length)}, +${Math.round(
                (output.length / carrierLength) * 100 - 100,
              )}%`}
            </Typography>
          )}
        </FormControl>
        <Stack mt={2} direction="row" justifyContent="flex-end">
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
        </Stack>
      </Box>
    </Page>
  );
};

export default UnicodeConcealer;
