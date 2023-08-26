import React, {
  FunctionComponent,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import { saveAs } from 'file-saver';
import {
  OutlinedInputProps,
  Grid,
  Link,
  Typography,
  FormControl,
  FormLabel,
  Box,
  OutlinedInput,
  Select,
  InputLabel,
  SelectProps,
  IconButton,
  Button,
  Menu,
  MenuItem,
  ListSubheader,
} from '@mui/material';
import {
  SwapHoriz as SwapHorizIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import { useDebounce } from 'use-debounce';
import { setupWorkerClient } from '../../../workers/utils';
import Page from '../../Page';
import Loader from '../../Loader';
import SolresolOutput, {
  SolresolOutputProps,
} from '../../music/solresol/SolresolOutput';
import { convertToSolresolForm } from './helpers';
import type {
  SolresolWorker,
  SolresolOutputType,
  TranslationOutputItems,
  TranslationOutputItem,
} from '../../../workers/music/solresol.worker';
import useAudioExporter from '../../../hooks/useAudioExporter';
import { chunk } from '../../../helpers';
import Abc from '../Abc';

const solresolWorker = setupWorkerClient<SolresolWorker>(
  new Worker(
    new URL('../../../workers/music/solresol.worker.ts', import.meta.url),
    { type: 'module' },
  ),
  ['computeSolresolOutput', 'computeEnglishOutput'],
);

const SolresolTranslator: FunctionComponent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const input = searchParams.get('input') ?? '';
  const outputType = (searchParams.get('type') ?? 'full') as SolresolOutputType;
  const swapped = searchParams.get('swap') === 'true';
  const [hint, setHint] = useState<string>('');
  const [output, setOutput] = useState<TranslationOutputItems>([]);
  const [comments, setComments] = useState<string>('');
  const [debouncedInput] = useDebounce(input, 300);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

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
      if (!debouncedInput) {
        setHint('');
        setOutput([]);
        setComments('');
        return;
      }

      const {
        output: possibleOutput,
        hint: possibleHint = '',
        comments: possibleComments = '',
      } = swapped
        ? await solresolWorker.computeEnglishOutput(debouncedInput)
        : await solresolWorker.computeSolresolOutput(debouncedInput);

      setOutput(possibleOutput);
      setHint(possibleHint !== debouncedInput ? possibleHint : '');
      setComments(possibleComments);
    };

    compute();
  }, [debouncedInput, swapped]);

  const cleanedOutputItems = useMemo(() => {
    const validOutputItems = output.filter(
      item => Array.isArray(item) && item.length,
    ) as TranslationOutputItem[][];

    return validOutputItems.map(
      item => item.find(({ preferred }) => preferred) ?? item[0],
    );
  }, [swapped, output]);

  const abcOutput = useMemo(() => {
    if (swapped || !output.length) {
      return '';
    }

    const abcOutputItems = cleanedOutputItems.flatMap((item, index) => {
      const englishForm = convertToSolresolForm(
        item.word,
        'english',
      ) as string[];
      return index < cleanedOutputItems.length - 1
        ? [...englishForm, 'z']
        : englishForm;
    });
    const abcNotes = chunk(abcOutputItems, 4)
      .map(itemsChunk => itemsChunk.join(' '))
      .join(' | ');

    return ['X: 1', 'M: 4/4', 'L: 1/4', abcNotes].join('\n');
  }, [cleanedOutputItems]);

  const handleSwapClick = useCallback(() => {
    setSearchParams(prev => {
      const prevSwapped = prev.get('swap') === 'true';
      prev.set('swap', (!prevSwapped).toString());
      return prev;
    });
  }, []);

  const handleInput = useCallback<NonNullable<OutlinedInputProps['onInput']>>(
    event => {
      setSearchParams(prev => {
        prev.set('input', (event.target as HTMLTextAreaElement).value);
        return prev;
      });
    },
    [],
  );

  const handleHintClick = useCallback(() => {
    setSearchParams(prev => {
      prev.set('input', hint);
      return prev;
    });
  }, [hint]);

  const handleOutputChange = useCallback((output: TranslationOutputItems) => {
    setOutput(output);
  }, []);

  const handleOutputTypeChange = useCallback<
    NonNullable<SelectProps['onChange']>
  >(event => {
    setSearchParams(prev => {
      prev.set('type', event.target.value as SolresolOutputType);
      return prev;
    });
  }, []);

  const formatTranslation = useCallback<
    NonNullable<SolresolOutputProps['formatTranslation']>
  >(
    word => (swapped ? word : convertToSolresolForm(word, outputType)),
    [outputType, swapped],
  );

  const handleExportButtonClick = useCallback(async () => {
    setExportMenuOpen(true);
  }, []);

  const handleExportMenuClose = useCallback(() => {
    setExportMenuOpen(false);
  }, []);

  const exportSolresol = useCallback(
    (outputType: SolresolOutputType) => async (title?: string) => {
      const { type, ext } = {
        full: { type: 'text/plain', ext: 'txt' },
        abbreviated: { type: 'text/plain', ext: 'txt' },
        english: { type: 'text/plain', ext: 'txt' },
        numeric: { type: 'text/plain', ext: 'txt' },
        color: { type: 'image/svg+xml', ext: 'svg' },
        scale: { type: 'image/svg+xml', ext: 'svg' },
        stenographic: { type: 'image/svg+xml', ext: 'svg' },
      }[outputType];
      const solresolForm = convertToSolresolForm(
        cleanedOutputItems.map(item => item.word),
        outputType,
      );
      const output = Array.isArray(solresolForm)
        ? solresolForm.join('')
        : renderToString(solresolForm as any);
      const blob = new Blob([output], { type });
      saveAs(blob, `${title ?? 'solresol'}.${ext}`);
    },
    [cleanedOutputItems],
  );

  const handleExport = useCallback(
    (exportFn: (title?: string) => Promise<void>) => async () => {
      handleExportMenuClose();
      await exportFn('solresol');
    },
    [],
  );

  return (
    <Page size="md">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  marginBottom={1}
                  height={48}
                >
                  <FormLabel>Input</FormLabel>
                  <IconButton
                    aria-label="Swap languages"
                    onClick={handleSwapClick}
                  >
                    <SwapHorizIcon />
                  </IconButton>
                </Box>
                <OutlinedInput
                  multiline
                  rows={5}
                  value={input}
                  onInput={handleInput}
                />
              </FormControl>
            </Grid>
            {hint && (
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  Did you mean:{' '}
                  <Link
                    color="secondary"
                    role="button"
                    style={{ cursor: 'pointer' }}
                    onClick={handleHintClick}
                  >
                    {hint}
                  </Link>
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              marginBottom={1}
              height={48}
            >
              <FormLabel>Output</FormLabel>
              {!swapped && (
                <FormControl variant="standard">
                  <InputLabel
                    shrink
                    id="demo-simple-select-placeholder-label-label"
                  >
                    Type
                  </InputLabel>
                  <Select
                    native
                    labelId="demo-simple-select-placeholder-label-label"
                    id="demo-simple-select-placeholder-label"
                    value={outputType}
                    onChange={handleOutputTypeChange}
                  >
                    <option value="full">Full</option>
                    <option value="abbreviated">Abbreviated</option>
                    <option value="english">English</option>
                    <option value="numeric">Numeric</option>
                    <option value="color">Color</option>
                    <option value="scale">Musical scale</option>
                    <option value="stenographic">Stenographic</option>
                  </Select>
                </FormControl>
              )}
            </Box>
            <SolresolOutput
              value={output}
              comments={comments}
              onChange={handleOutputChange}
              formatTranslation={formatTranslation}
            />
            {abcOutput && (
              <>
                <Abc {...getAbcProps({ src: abcOutput, hidden: true })} />
                <Box textAlign="right" mt={1}>
                  <Button
                    ref={exportButtonRef}
                    variant="contained"
                    color="secondary"
                    aria-controls="export-menu"
                    aria-haspopup="true"
                    endIcon={
                      exportMenuOpen ? (
                        <ArrowDropUpIcon />
                      ) : (
                        <ArrowDropDownIcon />
                      )
                    }
                    onClick={handleExportButtonClick}
                    disabled={!abcOutput || isExporting}
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
                    <ListSubheader>Text</ListSubheader>
                    <MenuItem onClick={handleExport(exportAbc)}>ABC</MenuItem>
                    <MenuItem onClick={handleExport(exportSolresol('full'))}>
                      Full
                    </MenuItem>
                    <MenuItem
                      onClick={handleExport(exportSolresol('abbreviated'))}
                    >
                      Abbreviated
                    </MenuItem>
                    <MenuItem onClick={handleExport(exportSolresol('english'))}>
                      English
                    </MenuItem>
                    <MenuItem onClick={handleExport(exportSolresol('numeric'))}>
                      Numeric
                    </MenuItem>
                    <ListSubheader>Audio</ListSubheader>
                    <MenuItem onClick={handleExport(exportWav)}>WAV</MenuItem>
                    <MenuItem onClick={handleExport(exportMp3)}>MP3</MenuItem>
                    <ListSubheader>Image (SVG)</ListSubheader>
                    <MenuItem onClick={handleExport(exportSvg)}>
                      Music sheet
                    </MenuItem>
                    <MenuItem onClick={handleExport(exportSolresol('color'))}>
                      Color code
                    </MenuItem>
                    <MenuItem onClick={handleExport(exportSolresol('scale'))}>
                      Musical scale
                    </MenuItem>
                    <MenuItem
                      onClick={handleExport(exportSolresol('stenographic'))}
                    >
                      Stenographic
                    </MenuItem>
                  </Menu>
                </Box>
              </>
            )}
          </FormControl>
        </Grid>
      </Grid>
    </Page>
  );
};

export default SolresolTranslator;
