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
  Tabs,
  Tab,
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

import TopbarLayout, { TopbarLayoutProps } from '../../components/TopbarLayout';
import Page from '../../components/Page';
import { setupWorkerClient } from '../../workers/utils';
import type {
  DecodedTextResult,
  UnicodeWorker,
} from '../../workers/text/unicode.worker';

const unicodeWorker = setupWorkerClient<UnicodeWorker>(
  new Worker(new URL('../../workers/text/unicode.worker.ts', import.meta.url), {
    type: 'module',
  }),
  ['encodeText', 'encodeBinary', 'decodeText', 'decodeBinary'],
);

enum UnicodeTab {
  CONCEAL = 'conceal',
  REVEAL = 'reveal',
}

const Label = styled(FormLabel)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const FileContainer = styled('p')<{ isDragActive?: boolean }>(
  ({ isDragActive }) => ({
    padding: '16.5px 14px',
    margin: 0,
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid rgba(0, 0, 0, 0.23)',
    height: '3.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      borderColor: '#000',
    },
    '&:active, &:focus': {
      borderColor: '#000',
      borderWidth: '2px',
    },
    ...(isDragActive && {
      borderColor: '#000',
      borderWidth: '2px',
    }),
  }),
);

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

const Unicode: FunctionComponent<TopbarLayoutProps> = props => {
  const [carrier, setCarrier] = useState('');
  const [payloadText, setPayloadText] = useState('');
  const [payloadFile, setPayloadFile] = useState<
    { name: string; content: Uint8Array } | undefined
  >();
  const [output, setOutput] = useState('');
  const [carrierWithPayload, setCarrierWithPayload] = useState('');
  const [payload, setPayload] = useState<DecodedTextResult | undefined>();
  const [currentTab, setCurrentTab] = useState(UnicodeTab.CONCEAL);
  const [copyToClipboardText, setCopyToClipboardText] =
    useState('Copy to clipboard');

  const data = useMemo(
    () => ({ carrier, payloadText, payloadFile }),
    [carrier, payloadText, payloadFile],
  );

  const [debouncedData] = useDebounce(data, 300);
  const [debouncedCarrierWithPayload] = useDebounce(carrierWithPayload, 300);

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
        (!debouncedData.payloadText && !debouncedData.payloadFile)
      ) {
        setOutput('');
        return;
      }

      if (debouncedData.payloadText) {
        const encodedText = await unicodeWorker.encodeText(
          carrier,
          debouncedData.payloadText,
        );

        setOutput(encodedText);
      } else if (debouncedData.payloadFile) {
        const encodedBinary = await unicodeWorker.encodeBinary(
          carrier,
          debouncedData.payloadFile.content,
        );

        setOutput(encodedBinary);
      }
    };

    compute();
  }, [debouncedData]);

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

  const handleEncodedOutputCopyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopyToClipboardText('Copied!');
    setTimeout(() => setCopyToClipboardText('Copy to clipboard'), 2000);
  };

  const handleEncodedOutputDownload = () => {
    saveAs(new Blob([output], { type: 'text/plain' }), 'output.txt');
  };

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
    <TopbarLayout
      title="Unicode"
      topbarContent={
        <Tabs
          value={currentTab}
          onChange={(_, newTab) => setCurrentTab(newTab)}
          textColor="inherit"
          indicatorColor="secondary"
          centered
        >
          <Tab value={UnicodeTab.CONCEAL} label="Conceal" />
          <Tab value={UnicodeTab.REVEAL} label="Reveal" />
        </Tabs>
      }
      {...props}
    >
      {currentTab === UnicodeTab.CONCEAL && (
        <Page size="md">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Label>Text in which to hide the message</Label>
                <OutlinedInput
                  multiline
                  rows={8}
                  value={carrier}
                  onInput={e =>
                    setCarrier((e.target as HTMLInputElement).value)
                  }
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <Label>Text to hide</Label>
                    <OutlinedInput
                      multiline
                      rows={4}
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
                      <Label>Or select a file instead</Label>
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
              <FormControl fullWidth>
                <Label>Output text</Label>
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
      )}
      {currentTab === UnicodeTab.REVEAL && (
        <Page size="md">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Label>Text with hidden message</Label>
                <OutlinedInput
                  multiline
                  rows={8}
                  value={carrierWithPayload}
                  onInput={event =>
                    setCarrierWithPayload(
                      (event.target as HTMLInputElement).value,
                    )
                  }
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Label>Original text</Label>
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
                <Label>Hidden text/file</Label>
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
                  <Tooltip title={copyToClipboardText}>
                    <IconButton
                      onClick={handleDecodedOutputCopyToClipboard}
                      disabled={!payload}
                    >
                      <FileCopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download as .txt">
                    <IconButton
                      onClick={handleDecodedOutputDownloadAsTxt}
                      disabled={!payload}
                    >
                      <SimCardDownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download as file">
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
      )}
    </TopbarLayout>
  );
};

export default Unicode;
