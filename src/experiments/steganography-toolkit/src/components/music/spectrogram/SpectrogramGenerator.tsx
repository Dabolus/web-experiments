import React, {
  FunctionComponent,
  useState,
  useCallback,
  useRef,
  useEffect,
  startTransition,
} from 'react';
import { useDropzone } from 'react-dropzone';
import colormap from 'colormap';
import WaveSurfer from 'wavesurfer.js';
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram';
import { saveAs } from 'file-saver';
import {
  Box,
  Grid,
  FormControl,
  FormHelperText,
  FormLabel,
  OutlinedInput,
  styled,
  IconButton,
  Tooltip,
  Select,
  Button,
  Stack,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  WarningAmber as WarningAmberIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import Page from '../../Page';
import { setupWorkerClient } from '../../../workers/utils';
import type {
  GetImageSpectrogramProgressMessage,
  SpectrogramWorker,
} from '../../../workers/music/spectrogram.worker';
import { getImageData, readFile } from '../../../helpers';
import FileContainer, { UserFile } from '../../text/unicode/FileContainer';
import LoadingOverlay from '../../LoadingOverlay';

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

const Label = styled(FormLabel)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

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
  const [image, setImage] = useState<UserFile<string> | undefined>();
  const [duration, setDuration] = useState(10);
  const [sampleRate, setSampleRate] = useState(44100);
  const [minFrequency, setMinFrequency] = useState(0);
  const [maxFrequency, setMaxFrequency] = useState(sampleRate / 2);
  const [density, setDensity] = useState(4);
  const [logarithmic, setLogarithmic] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] =
    useState<GetImageSpectrogramProgressMessage>(endStatus);
  const isProcessing = status.progress < 1;
  const [waveSurfer, setWaveSurfer] = useState<WaveSurfer | undefined>();
  const [output, setOutput] = useState<Blob | undefined>();
  const spectrogramContainerRef = useRef<HTMLDivElement | null>(null);

  const onFileDrop = useCallback(async ([acceptedFile]: File[]) => {
    const content = await readFile(acceptedFile, 'dataURL');
    setImage({ name: acceptedFile.name, content });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    disabled: isProcessing,
    onDrop: onFileDrop,
    accept: {
      'image/*': [
        '.png',
        '.gif',
        '.jpeg',
        '.jpg',
        '.bmp',
        '.webp',
        '.avif',
        '.svg',
      ],
    },
  });

  const generate = async () => {
    if (!image || !spectrogramContainerRef?.current) {
      return;
    }
    setStatus(startStatus);
    const imageData = await getImageData(image.content);
    const aspectRatio = imageData.width / imageData.height;
    const resizedImageWidth = Math.round(spectrogramHeight * aspectRatio);
    const outputWav = await spectrogramWorker.getImageSpectrogram({
      imageData,
      density,
      duration,
      sampleRate,
      minFrequency,
      maxFrequency,
      logarithmic,
    });

    setOutput(outputWav);

    const waveSurferOptions = {
      container: spectrogramContainerRef.current!,
      height: 20,
      fillParent: false,
      sampleRate,
      // Compute px per second so that the image has the correct aspect ratio
      minPxPerSec: Math.round(resizedImageWidth / duration),
      plugins: [
        Spectrogram.create({
          labels: true,
          labelsColor: 'rgba(0,0,0,0)',
          height: spectrogramHeight,
          frequencyMin: 0,
          frequencyMax: sampleRate / 2,
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
  };

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
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <div {...getRootProps()}>
                  <Label>Image</Label>
                  <input {...getInputProps()} />
                  <FileContainer
                    isDragActive={isDragActive}
                    disabled={isProcessing}
                  >
                    {image?.name || 'Drop a file here, or click to select file'}
                  </FileContainer>
                </div>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Label>Density</Label>
                <OutlinedInput
                  type="number"
                  inputProps={{ min: 1, max: 10 }}
                  value={density}
                  onInput={e =>
                    setDensity((e.target as HTMLInputElement).valueAsNumber)
                  }
                  disabled={isProcessing}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Label>Duration (seconds, spectrogram width)</Label>
                <OutlinedInput
                  type="number"
                  inputProps={{ min: 1, max: 60 }}
                  value={duration}
                  onInput={e =>
                    setDuration((e.target as HTMLInputElement).valueAsNumber)
                  }
                  disabled={isProcessing}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Label>Sample rate</Label>
                <Select
                  native
                  variant="outlined"
                  value={sampleRate}
                  onChange={e => {
                    const newSampleRate = Number(e.target.value);
                    const newFrequency = Math.floor(newSampleRate / 2);
                    setSampleRate(newSampleRate);
                    setMinFrequency(Math.min(minFrequency, newFrequency - 50));
                    setMaxFrequency(newFrequency);
                  }}
                  disabled={isProcessing}
                >
                  <option value={8000}>8 kHz</option>
                  <option value={11025}>11.025 kHz</option>
                  <option value={16000}>16 kHz</option>
                  <option value={22050}>22.05 kHz</option>
                  <option value={44100}>44.1 kHz</option>
                  <option value={48000}>48 kHz</option>
                  <option value={88200}>88.2 kHz</option>
                  <option value={96000}>96 kHz</option>
                  <option value={176400}>176.4 kHz</option>
                  <option value={192000}>192 kHz</option>
                  <option value={352800}>352.8 kHz</option>
                  <option value={384000}>384 kHz</option>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Label>Min frequency (hertz, spectrogram start height)</Label>
                <OutlinedInput
                  type="number"
                  inputProps={{ min: 0, max: maxFrequency - 50, step: 50 }}
                  value={minFrequency}
                  onInput={e =>
                    setMinFrequency(
                      (e.target as HTMLInputElement).valueAsNumber,
                    )
                  }
                  disabled={isProcessing}
                />
                {minFrequency > sampleRate / 2 && (
                  <FormHelperText component={Stack}>
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      <WarningAmberIcon fontSize="inherit" />
                      <div>
                        Value is above the niquist frequency (half the sample
                        rate).
                      </div>
                    </Stack>
                    <Box sx={{ ml: 2 }}>This will cause audio aliasing.</Box>
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Label>Max frequency (hertz, spectrogram end height)</Label>
                <OutlinedInput
                  type="number"
                  inputProps={{ min: minFrequency + 50, max: 200000, step: 50 }}
                  value={maxFrequency}
                  onInput={e =>
                    setMaxFrequency(
                      (e.target as HTMLInputElement).valueAsNumber,
                    )
                  }
                  disabled={isProcessing}
                />
                {maxFrequency > sampleRate / 2 && (
                  <FormHelperText component={Stack}>
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      <WarningAmberIcon fontSize="inherit" />
                      <div>
                        Value is above the niquist frequency (half the sample
                        rate).
                      </div>
                    </Stack>
                    <Box sx={{ ml: 2 }}>This will cause audio aliasing.</Box>
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                disabled={isProcessing}
                label="Use logarithmic scale"
                control={
                  <Checkbox
                    value={logarithmic}
                    onChange={e => setLogarithmic(e.target.checked)}
                  />
                }
              />
              {logarithmic && (
                <FormHelperText
                  component={Stack}
                  direction="row"
                  alignItems="center"
                  gap={0.5}
                >
                  <WarningAmberIcon fontSize="inherit" />
                  <div>Output will look less precise</div>
                </FormHelperText>
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} display="flex" justifyContent="center">
          <Button
            variant="contained"
            disabled={!image || isPlaying || isProcessing}
            onClick={generate}
          >
            Generate
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Stack
            alignItems="center"
            justifyContent="center"
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
        </Grid>
        <Grid item xs={12} display="flex" justifyContent="center">
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
        </Grid>
      </Grid>
    </Page>
  );
};

export default SpectrogramGenerator;
