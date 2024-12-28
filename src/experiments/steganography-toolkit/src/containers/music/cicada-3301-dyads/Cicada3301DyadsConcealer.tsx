import React, {
  FunctionComponent,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { useDebounce } from 'use-debounce';
import { setupWorkerClient } from '@easy-worker/core';
import { Button, Menu, MenuItem, Box, Grid2 as Grid } from '@mui/material';
import {
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import Page from '../../../components/Page';
import Cicada3301DyadsForm, {
  Cicada3301DyadsFormProps,
  Cicada3301DyadsFormValue,
} from '../../../components/music/cicada-3301-dyads/Cicada3301DyadsForm';
import Abc from '../../../components/music/Abc';
import Loader from '../../../components/Loader';
import type { Cicada3301DyadsWorker } from '../../../workers/music/cicada-3301-dyads.worker';
import useAudioExporter from '../../../hooks/useAudioExporter';

const cicada3301Worker = new Worker(
  new URL(
    '../../../workers/music/cicada-3301-dyads.worker.ts',
    import.meta.url,
  ),
  { type: 'module' },
);

const cicada3301WorkerClient =
  setupWorkerClient<Cicada3301DyadsWorker>(cicada3301Worker);

const Cicada3301DyadsConcealer: FunctionComponent = () => {
  const [data, setData] = useState<Cicada3301DyadsFormValue>();
  const [input, setInput] = useState<string>();
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const [debouncedData] = useDebounce(data, 300);

  const exportButtonRef = useRef<HTMLButtonElement>(null);

  const {
    isExporting,
    getAbcProps,
    exportAbc,
    exportSvg,
    exportWav,
    exportMp3,
  } = useAudioExporter();

  useEffect(() => {
    const compute = async () => {
      if (debouncedData) {
        const computedAbc = await cicada3301WorkerClient.computeAbc(
          debouncedData,
        );

        setInput(computedAbc);
      }
    };

    compute();
  }, [debouncedData]);

  const handleFormChange = useCallback<
    NonNullable<Cicada3301DyadsFormProps['onChange']>
  >(data => {
    setData(data);
  }, []);

  const handleExportButtonClick = useCallback(async () => {
    setExportMenuOpen(true);
  }, []);

  const handleExportMenuClose = useCallback(() => {
    setExportMenuOpen(false);
  }, []);

  const handleExport = useCallback(
    (exportFn: (title?: string) => Promise<void>) => async () => {
      handleExportMenuClose();
      await exportFn(data?.title);
    },
    [data],
  );

  return (
    <Page title="Music - Cicada 3301 Dyads - Conceal">
      <Grid container spacing={3}>
        <Grid size={12}>
          <Cicada3301DyadsForm onChange={handleFormChange} />
        </Grid>
        <Grid size={12}>
          <Box textAlign="center">
            <Button
              ref={exportButtonRef}
              variant="contained"
              color="secondary"
              aria-controls="export-menu"
              aria-haspopup="true"
              endIcon={
                exportMenuOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
              }
              onClick={handleExportButtonClick}
              disabled={!data?.input || isExporting}
            >
              {isExporting && <Loader size={24} />}
              Export as
            </Button>
            <Menu
              id="export-menu"
              anchorEl={exportButtonRef.current}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
              }}
              transformOrigin={{
                horizontal: 'right',
                vertical: 'top',
              }}
              keepMounted
              open={exportMenuOpen}
              onClose={handleExportMenuClose}
            >
              <MenuItem onClick={handleExport(exportAbc)}>ABC</MenuItem>
              <MenuItem onClick={handleExport(exportSvg)}>SVG</MenuItem>
              <MenuItem onClick={handleExport(exportWav)}>WAV</MenuItem>
              <MenuItem onClick={handleExport(exportMp3)}>MP3</MenuItem>
            </Menu>
          </Box>
        </Grid>
        <Grid size={12}>
          <Abc {...getAbcProps({ src: input })} />
        </Grid>
      </Grid>
    </Page>
  );
};

export default Cicada3301DyadsConcealer;
