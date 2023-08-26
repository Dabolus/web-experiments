import React, {
  FunctionComponent,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';

import { useDebounce } from 'use-debounce';

import { Button, Menu, MenuItem, Box, Grid } from '@mui/material';

import {
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';

import TopbarLayout, { TopbarLayoutProps } from '../../components/TopbarLayout';
import Page from '../../components/Page';
import Cicada3301Form, {
  Cicada3301FormProps,
  Cicada3301FormValue,
} from '../../components/music/Cicada3301Form';
import Abc from '../../components/music/Abc';
import Loader from '../../components/Loader';
import { setupWorkerClient } from '../../workers/utils';
import type { Cicada3301Worker } from '../../workers/music/cicada3301.worker';
import useAudioExporter from '../../hooks/useAudioExporter';

const cicada3301Worker = setupWorkerClient<Cicada3301Worker>(
  new Worker(
    new URL('../../workers/music/cicada3301.worker.ts', import.meta.url),
    { type: 'module' },
  ),
  ['computeAbc'],
);

const Cicada3301: FunctionComponent<TopbarLayoutProps> = props => {
  const [data, setData] = useState<Cicada3301FormValue>();
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
        const computedAbc = await cicada3301Worker.computeAbc(debouncedData);

        setInput(computedAbc);
      }
    };

    compute();
  }, [debouncedData]);

  const handleFormChange = useCallback<
    NonNullable<Cicada3301FormProps['onChange']>
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
    <TopbarLayout title="Cicada 3301" {...props}>
      <Page>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Cicada3301Form onChange={handleFormChange} />
          </Grid>
          <Grid item xs={12}>
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
          <Grid item xs={12}>
            <Abc {...getAbcProps({ src: input })} />
          </Grid>
        </Grid>
      </Page>
    </TopbarLayout>
  );
};

export default Cicada3301;
