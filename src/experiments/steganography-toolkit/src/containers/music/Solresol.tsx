import React, {
  FunctionComponent,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';

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

import TopbarLayout, { TopbarLayoutProps } from '../../components/TopbarLayout';
import Page from '../../components/Page';
import { setupWorkerClient } from '../../workers/utils';

import SolresolOutput, {
  SolresolOutputProps,
} from '../../components/music/SolresolOutput';

import type {
  SolresolWorker,
  SolresolOutputType,
  TranslationOutputItems,
} from '../../workers/music/solresol.worker';

const solresolWorker = setupWorkerClient<SolresolWorker>(
  new Worker(
    new URL('../../workers/music/solresol.worker.ts', import.meta.url),
    { type: 'module' },
  ),
  ['computeSolresolOutput', 'computeEnglishOutput'],
);

const fullSolresolCodes = [
  undefined,
  'do',
  're',
  'mi',
  'fa',
  'sol',
  'la',
  'si',
];
const abbreviatedSolresolCodes = [
  undefined,
  'd',
  'r',
  'm',
  'f',
  'so',
  'l',
  's',
];
const englishSolresolCodes = [undefined, 'C', 'D', 'E', 'F', 'G', 'A', 'B'];
const colorSolresolCodes = [
  undefined,
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'indigo',
  'violet',
];
const stenographicSolresolCodes = [
  undefined,
  // do
  {
    path: `
      a 25,25 0 1,1 50,0
      a 25,25 0 1,1 -50,0
      m 50, 0
    `,
    // m 42.7, 17.7
    area: [0, -25, 50, 25],
  },
  // re
  {
    path: `l 0, 50`,
    area: [0, 0, 0, 50],
  },
  // mi
  {
    path: `a 25,25 0 1,1 50,0`,
    area: [0, -25, 50, 0],
  },
  // fa
  {
    path: `l 50, 50`,
    area: [0, 0, 50, 50],
  },
  // sol
  {
    path: `l 50, 0`,
    area: [0, 0, 50, 0],
  },
  // la
  {
    path: `a 25,25 0 0,0 0,50`,
    area: [-25, 0, 0, 50],
  },
  // si
  {
    path: `l 50, -50`,
    area: [0, -50, 50, 0],
  },
];

const convertToSolresolForm = (
  word: string,
  classes: Record<string, string>,
  type: SolresolOutputType,
): ReactNode => {
  switch (type) {
    case 'full':
      return [...word].map(code => fullSolresolCodes[Number(code)]);
    case 'abbreviated':
      return [...word].map(code => abbreviatedSolresolCodes[Number(code)]);
    case 'english':
      return [...word].map(code => englishSolresolCodes[Number(code)]);
    case 'numeric':
      return word;
    case 'color':
      return (
        <svg
          viewBox={`0 0 ${word.length * 3} 4`}
          role="img"
          aria-labelledby={`${word}-title`}
          className={classes.colorTranslation}
        >
          <title id={`${word}-title`}>
            {convertToSolresolForm(word, classes, 'full')}
          </title>
          {[...word].map((code, index) => (
            <rect
              key={index}
              width="3"
              height="4"
              x={index * 3}
              y="0"
              fill={colorSolresolCodes[Number(code)]}
            />
          ))}
        </svg>
      );
    case 'stenographic':
      let [minX, minY, maxX, maxY] = [0, 0, 0, 0];
      const path = [...word]
        .map(code => {
          const { path = '', area = [0, 0, 0, 0] } =
            stenographicSolresolCodes[Number(code)] || {};
          minX += area[0];
          minY += area[1];
          maxX += area[2];
          maxY += area[3];
          return path;
        })
        .join(' ');
      const width = maxX - minX;
      const height = maxY - minY;
      return (
        <svg
          viewBox={`${minX - 2} ${minY - 2} ${width + 4} ${height + 4}`}
          role="img"
          aria-labelledby={`${word}-title`}
          className={classes.stenographicTranslation}
          style={{ height: `${height / 50}rem` }}
        >
          <title id={`${word}-title`}>
            {convertToSolresolForm(word, classes, 'full')}
          </title>
          <path d={`m 0,0 ${path}`} />
        </svg>
      );
  }
};

const Solresol: FunctionComponent<TopbarLayoutProps> = props => {
  const [input, setInput] = useState<string>('');
  const [hint, setHint] = useState<string>('');
  const [output, setOutput] = useState<TranslationOutputItems>([]);
  const [comments, setComments] = useState<string>('');
  const [outputType, setOutputType] = useState<SolresolOutputType>('full');
  const [swapped, setSwapped] = useState(false);

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
    setSwapped(prev => !prev);
  }, []);

  const handleInput = useCallback<NonNullable<OutlinedInputProps['onInput']>>(
    event => {
      setInput((event.target as HTMLTextAreaElement).value);
    },
    [],
  );

  const handleHintClick = useCallback(() => {
    setInput(hint);
  }, [hint]);

  const handleOutputChange = useCallback((output: TranslationOutputItems) => {
    setOutput(output);
  }, []);

  const handleOutputTypeChange = useCallback<
    NonNullable<SelectProps['onChange']>
  >(event => {
    setOutputType(event.target.value as SolresolOutputType);
  }, []);

  const formatTranslation = useCallback<
    NonNullable<SolresolOutputProps['formatTranslation']>
  >(
    (word, classes) =>
      swapped ? word : convertToSolresolForm(word, classes, outputType),
    [outputType, swapped],
  );

  return (
    <TopbarLayout title="Solresol" {...props}>
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
                      aria-label="swap languages"
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
    </TopbarLayout>
  );
};

export default Solresol;
