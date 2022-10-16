import React, {
  FunctionComponent,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';

import { useDebounce } from 'use-debounce';

import ABCJS from 'abcjs';

import { saveAs } from 'file-saver';

import { Button, Menu, MenuItem, Box, Grid } from '@material-ui/core';

import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import TopbarLayout, { TopbarLayoutProps } from '../../components/TopbarLayout';
import Page from '../../components/Page';
import Cicada3301Form, {
  Cicada3301FormProps,
  Cicada3301FormValue,
} from '../../components/music/Cicada3301Form';
import Abc, { AbcProps } from '../../components/music/Abc';
import Loader from '../../components/Loader';

import * as Cicada3301Worker from '../../workers/music/cicada3301.worker';

const {
  computeAbc,
  encodeMp3,
} = new (Cicada3301Worker as any)() as typeof Cicada3301Worker;

const Cicada3301: FunctionComponent<TopbarLayoutProps> = (props) => {
  const [data, setData] = useState<Cicada3301FormValue>();
  const [input, setInput] = useState<string>();
  const [abcRenderOutput, setAbcRenderOutput] = useState<any>();
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [debouncedData] = useDebounce(data, 300);

  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const abcRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const compute = async () => {
      if (debouncedData) {
        const computedAbc = await computeAbc(debouncedData);

        setInput(computedAbc);
      }
    };

    compute();
  }, [debouncedData]);

  const handleFormChange = useCallback<
    NonNullable<Cicada3301FormProps['onChange']>
  >((data) => {
    setData(data);
  }, []);

  const handleAbcRender = useCallback<NonNullable<AbcProps['onRender']>>(
    ([output]) => {
      setAbcRenderOutput(output);
    },
    [],
  );

  const handleExportButtonClick = useCallback(async () => {
    setExportMenuOpen(true);
  }, []);

  const handleExportMenuClose = useCallback(() => {
    setExportMenuOpen(false);
  }, []);

  const handleAbcExport = useCallback(() => {
    if (!input) {
      return;
    }

    handleExportMenuClose();

    setIsExporting(true);

    const blob = new Blob([input], { type: 'text/vnd.abc' });

    saveAs(blob, `${data?.title || 'song'}.abc`);

    setIsExporting(false);
  }, [data, handleExportMenuClose, input]);

  const handleSvgExport = useCallback(() => {
    if (!abcRenderOutput || !abcRef.current) {
      return;
    }

    handleExportMenuClose();

    setIsExporting(true);

    const svg = abcRef.current.querySelector('svg')?.outerHTML;

    if (!svg) {
      return;
    }

    const transformedSvg = svg.replace(
      '<svg',
      '<svg xmlns="http://www.w3.org/2000/svg"',
    );

    const blob = new Blob([transformedSvg], { type: 'image/svg+xml' });

    saveAs(blob, `${data?.title || 'song'}.svg`);

    setIsExporting(false);
  }, [abcRenderOutput, data, handleExportMenuClose]);

  const getWavUrl = useCallback(async (): Promise<string> => {
    const audioContext = new AudioContext();
    await audioContext.resume();

    const midiBuffer = new ABCJS.synth.CreateSynth();
    await midiBuffer.init({
      visualObj: abcRenderOutput,
      audioContext,
      millisecondsPerMeasure: abcRenderOutput.millisecondsPerMeasure(),
      options: {
        soundFontUrl: `${process.env.PUBLIC_URL}/sounds/`,
        program: 0,
      },
    });
    await midiBuffer.prime();

    return midiBuffer.download();
  }, [abcRenderOutput]);

  const handleWavExport = useCallback(async () => {
    if (!abcRenderOutput) {
      return;
    }

    handleExportMenuClose();

    setIsExporting(true);

    const wavUrl = await getWavUrl();

    saveAs(wavUrl, `${data?.title || 'song'}.wav`);

    setIsExporting(false);
  }, [abcRenderOutput, data, getWavUrl, handleExportMenuClose]);

  const handleMp3Export = useCallback(async () => {
    if (!abcRenderOutput) {
      return;
    }

    handleExportMenuClose();

    setIsExporting(true);

    const wavUrl = await getWavUrl();

    const mp3 = await encodeMp3(wavUrl);

    saveAs(mp3, `${data?.title || 'song'}.mp3`);

    setIsExporting(false);
  }, [abcRenderOutput, data, getWavUrl, handleExportMenuClose]);

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
                getContentAnchorEl={null}
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
                <MenuItem onClick={handleAbcExport}>abc</MenuItem>
                <MenuItem onClick={handleSvgExport}>SVG</MenuItem>
                <MenuItem onClick={handleWavExport}>WAV</MenuItem>
                <MenuItem onClick={handleMp3Export}>MP3</MenuItem>
              </Menu>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Abc ref={abcRef} src={input} onRender={handleAbcRender} />
          </Grid>
        </Grid>
      </Page>
    </TopbarLayout>
  );
};

export default Cicada3301;
