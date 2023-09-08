import React, {
  FunctionComponent,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  Fragment,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import { saveAs } from 'file-saver';
import {
  OutlinedInputProps,
  Unstable_Grid2 as Grid,
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
import {
  SolresolInputType,
  SolresolOutputType,
  SolresolType,
  convertToSolresolForm,
  detectSolresolInputType,
  isSolresolInputType,
  isSolresolOutputType,
  convertSolresolInput,
} from './helpers';
import type {
  SolresolWorker,
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
  const input = searchParams.get('text') ?? '';
  const swapped = searchParams.has('swap');
  const inputTypeParam = searchParams.get('it');
  const outputTypeParam = searchParams.get('ot');
  const inputType =
    swapped && isSolresolInputType(inputTypeParam) ? inputTypeParam : 'auto';
  const outputType =
    !swapped && isSolresolOutputType(outputTypeParam)
      ? outputTypeParam
      : 'full';
  const [detectedInputType, setDetectedInputType] = useState<Exclude<
    SolresolInputType,
    'auto'
  > | null>(null);
  const finalInputType: Exclude<SolresolInputType, 'auto'> =
    inputType === 'auto' ? detectedInputType ?? 'full' : inputType;
  const [output, setOutput] = useState<TranslationOutputItems>([]);
  const [hint, setHint] = useState<TranslationOutputItems>([]);
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
        setDetectedInputType(null);
        setOutput([]);
        setHint([]);
        return;
      }

      if (swapped) {
        setDetectedInputType(detectSolresolInputType(debouncedInput));
      }

      const normalizedInput = swapped
        ? convertSolresolInput(debouncedInput, finalInputType, 'numeric')
        : debouncedInput;

      const { output: possibleOutput, hint: possibleHint = [] } = swapped
        ? await solresolWorker.computeEnglishOutput(normalizedInput)
        : await solresolWorker.computeSolresolOutput(normalizedInput);

      const transformedOutput = possibleOutput.map(item =>
        typeof item === 'string'
          ? convertSolresolInput(item, 'numeric', finalInputType)
          : item,
      );
      const transformedHint = possibleHint.map(item =>
        typeof item === 'string'
          ? convertSolresolInput(item, 'numeric', finalInputType)
          : {
              ...item,
              words: item.words.map(word => ({
                ...word,
                word: convertSolresolInput(
                  word.word,
                  'numeric',
                  finalInputType,
                ),
              })),
            },
      );

      setOutput(transformedOutput);
      setHint(transformedHint);
    };

    compute();
  }, [debouncedInput, finalInputType, swapped]);

  const cleanedOutputItems = useMemo(() => {
    const validOutputItems = output.filter(
      item => typeof item !== 'string' && item.words.length,
    ) as unknown as TranslationOutputItem[];

    return validOutputItems.map(
      item => item.words.find(({ preferred }) => preferred) ?? item.words[0],
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

  const handleSwapClick = () => {
    setSearchParams(prev => {
      if (prev.has('swap')) {
        prev.delete('swap');
      } else {
        prev.set('swap', '');
      }
      return prev;
    });
  };

  const handleInput: NonNullable<OutlinedInputProps['onInput']> = event => {
    setSearchParams(prev => {
      prev.set('text', (event.target as HTMLTextAreaElement).value);
      return prev;
    });
  };

  const handleHintClick = () => {
    const hintText = hint
      .map(item => (typeof item === 'string' ? item : item.words[0].word))
      .join('');
    setSearchParams(prev => {
      prev.set('text', hintText);
      return prev;
    });
  };

  const handleOutputChange = (output: TranslationOutputItems) => {
    setOutput(output);
  };

  const handleTypeChange =
    (param: string): NonNullable<SelectProps['onChange']> =>
    event => {
      setSearchParams(prev => {
        prev.set(param, event.target.value as SolresolType);
        return prev;
      });
    };

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

  const exportSolresol =
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
    };

  const handleExport = useCallback(
    (exportFn: (title?: string) => Promise<void>) => async () => {
      handleExportMenuClose();
      await exportFn('solresol');
    },
    [],
  );

  return (
    <Page size="md" title="Music - Solresol - Translate">
      <Grid container spacing={3} columns={13}>
        <Grid xs={13} sm={6}>
          <FormControl fullWidth>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              marginBottom={1}
              height={48}
            >
              <FormLabel>{swapped ? 'Solresol' : 'English'}</FormLabel>
              {swapped && (
                <FormControl variant="standard">
                  <InputLabel shrink id="solresol-input-type-label">
                    Type
                  </InputLabel>
                  <Select
                    native
                    labelId="solresol-input-type-label"
                    id="solresol-input-type"
                    value={inputType}
                    onChange={handleTypeChange('it')}
                    sx={{ width: 160 }}
                  >
                    <option value="auto">
                      Detect{detectedInputType ? ` (${detectedInputType})` : ''}
                    </option>
                    <option value="full">Full</option>
                    <option value="abbreviated">Abbreviated</option>
                    <option value="numeric">Numeric</option>
                  </Select>
                </FormControl>
              )}
            </Box>
            <OutlinedInput
              multiline
              rows={5}
              value={input}
              onInput={handleInput}
            />
          </FormControl>
          {hint.length > 0 && (
            <Typography variant="subtitle1" mt={1}>
              Did you mean:{' '}
              <Link
                color="secondary"
                role="button"
                style={{ cursor: 'pointer' }}
                onClick={handleHintClick}
              >
                {hint.map((item, index) => (
                  <Fragment key={index}>
                    {typeof item === 'string' ? (
                      item
                    ) : (
                      <strong>{item.words[0].word}</strong>
                    )}
                  </Fragment>
                ))}
              </Link>
            </Typography>
          )}
        </Grid>
        <Grid xs={13} sm={1} sx={{ textAlign: 'center' }}>
          <IconButton aria-label="Swap languages" onClick={handleSwapClick}>
            <SwapHorizIcon />
          </IconButton>
        </Grid>
        <Grid xs={13} sm={6}>
          <FormControl fullWidth>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              marginBottom={1}
              height={48}
            >
              <FormLabel>{swapped ? 'English' : 'Solresol'}</FormLabel>
              {!swapped && (
                <FormControl variant="standard">
                  <InputLabel shrink id="solresol-output-type-label">
                    Type
                  </InputLabel>
                  <Select
                    native
                    labelId="solresol-output-type-label"
                    id="solresol-output-type"
                    value={outputType}
                    onChange={handleTypeChange('ot')}
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
