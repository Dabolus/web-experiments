import React, {
  FunctionComponent,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useSearchParams } from 'react-router-dom';
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
} from '@mui/material';
import { SwapHoriz as SwapHorizIcon } from '@mui/icons-material';
import { useDebounce } from 'use-debounce';
import { setupWorkerClient } from '../../../workers/utils';
import Page from '../../Page';
import SolresolOutput, {
  SolresolOutputProps,
} from '../../music/solresol/SolresolOutput';
import { convertToSolresolForm } from './helpers';
import type {
  SolresolWorker,
  SolresolOutputType,
  TranslationOutputItems,
} from '../../../workers/music/solresol.worker';

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
  const outputType = searchParams.get('type') as SolresolOutputType;
  const swapped = searchParams.get('swap') === 'true';
  const [hint, setHint] = useState<string>('');
  const [output, setOutput] = useState<TranslationOutputItems>([]);
  const [comments, setComments] = useState<string>('');
  const [debouncedInput] = useDebounce(input, 300);

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
          </FormControl>
        </Grid>
      </Grid>
    </Page>
  );
};

export default SolresolTranslator;
