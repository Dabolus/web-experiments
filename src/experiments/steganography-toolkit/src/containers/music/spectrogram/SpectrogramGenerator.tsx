import React, {
  FunctionComponent,
  useState,
  useRef,
  useEffect,
  startTransition,
} from 'react';
import { useDebouncedCallback } from 'use-debounce';
import colormap from 'colormap';
import WaveSurfer from 'wavesurfer.js';
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram';
import { saveAs } from 'file-saver';
import { IconButton, Tooltip, Stack, Typography } from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import Page from '../../../components/Page';
import { setupWorkerClient } from '../../../workers/utils';
import type {
  GetImageSpectrogramProgressMessage,
  SpectrogramWorker,
} from '../../../workers/music/spectrogram.worker';
import LoadingOverlay from '../../../components/LoadingOverlay';
import SpectrogramGeneratorForm, {
  SpectrogramGeneratorFormProps,
} from '../../../components/music/spectrogram/SpectrogramGeneratorForm';

const spectrogramWorker = setupWorkerClient<SpectrogramWorker>(
  new Worker(
    new URL('../../../workers/music/spectrogram.worker.ts', import.meta.url),
    {
      type: 'module',
    },
  ),
  ['getImageSpectrogram'],
);

const spectrogramHeight = 256;

const colorMap = colormap({
  colormap: 'jet',
  nshades: 256,
  format: 'float',
});

const statusToLabelMap: Record<
  GetImageSpectrogramProgressMessage['phase'],
  string
> = {
  start: 'Starting...',
  preprocess: 'Preprocessing...',
  process: 'Processing...',
  encode: 'Encoding...',
  end: 'Done',
};
const startStatus: GetImageSpectrogramProgressMessage = {
  type: 'progress',
  phase: 'start',
  progress: 0,
};
const endStatus: GetImageSpectrogramProgressMessage = {
  type: 'progress',
  phase: 'end',
  progress: 1,
};

const SpectrogramGenerator: FunctionComponent = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] =
    useState<GetImageSpectrogramProgressMessage>(endStatus);
  const isProcessing = status.progress < 1;
  const [waveSurfer, setWaveSurfer] = useState<WaveSurfer | undefined>();
  const [output, setOutput] = useState<Blob | undefined>();
  const spectrogramContainerRef = useRef<HTMLDivElement | null>(null);

  const handleChange = useDebouncedCallback<
    NonNullable<SpectrogramGeneratorFormProps['onChange']>
  >(async data => {
    if (!data.image || !spectrogramContainerRef?.current) {
      return;
    }
    setStatus(startStatus);
    const imageData = data.image
      .getContext('2d')!
      .getImageData(0, 0, data.image.width, data.image.height);
    const aspectRatio = imageData.width / imageData.height;
    const resizedImageWidth = Math.round(spectrogramHeight * aspectRatio);
    const outputWav = await spectrogramWorker.getImageSpectrogram({
      imageData,
      density: data.density,
      duration: data.duration,
      sampleRate: data.sampleRate,
      minFrequency: data.minFrequency,
      maxFrequency: data.maxFrequency,
      logarithmic: data.logarithmic,
    });

    setOutput(outputWav);

    const waveSurferOptions = {
      container: spectrogramContainerRef.current!,
      height: 20,
      fillParent: false,
      sampleRate: data.sampleRate,
      // Compute px per second so that the image has the correct aspect ratio
      minPxPerSec: Math.round(resizedImageWidth / data.duration),
      plugins: [
        Spectrogram.create({
          labels: true,
          labelsColor: 'rgba(0,0,0,0)',
          height: spectrogramHeight,
          frequencyMin: 0,
          frequencyMax: data.sampleRate / 2,
          colorMap,
        }),
      ],
    };

    if (waveSurfer) {
      waveSurfer.setOptions(waveSurferOptions);
      waveSurfer.loadBlob(outputWav);
      setStatus(endStatus);
      return;
    }

    const ws = WaveSurfer.create(waveSurferOptions);
    ws.loadBlob(outputWav);
    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    setWaveSurfer(ws);
    setStatus(endStatus);
  }, 300);

  useEffect(() => {
    const updateStatus = (event: MessageEvent) => {
      if (event.data.type !== 'progress') {
        return;
      }
      startTransition(() => setStatus(event.data));
    };
    spectrogramWorker.addEventListener('message', updateStatus);
    return () => {
      spectrogramWorker.removeEventListener('message', updateStatus);
    };
  }, []);

  return (
    <Page size="md" title="Music - Spectrogram - Generate">
      <SpectrogramGeneratorForm
        disabled={isPlaying || isProcessing}
        onChange={handleChange}
      />
      <Stack alignItems="center" spacing={3} mt={3}>
        <Stack
          alignItems="center"
          justifyContent="center"
          width="100%"
          height={276}
          position="relative"
        >
          {!waveSurfer && !isProcessing && (
            <Typography>The spectrogram will appear here</Typography>
          )}
          {isProcessing && (
            <LoadingOverlay
              zIndex={3}
              status={statusToLabelMap[status.phase]}
              progress={status.progress}
            />
          )}
          <div ref={spectrogramContainerRef} />
        </Stack>
        <div>
          <Tooltip
            title={
              waveSurfer && !isProcessing ? (isPlaying ? 'Pause' : 'Play') : ''
            }
          >
            <IconButton
              onClick={() => waveSurfer?.playPause()}
              disabled={!waveSurfer || isProcessing}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={output && !isProcessing ? 'Download as .wav' : ''}>
            <IconButton
              onClick={() => saveAs(output!, 'spectrogram.wav')}
              disabled={!output || isProcessing}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Stack>
    </Page>
  );
};

export default SpectrogramGenerator;
