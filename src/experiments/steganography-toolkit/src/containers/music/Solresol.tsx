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
} from '@material-ui/core';

import SwapHorizIcon from '@material-ui/icons/SwapHoriz';

import { useDebounce } from 'use-debounce';

import TopbarLayout, { TopbarLayoutProps } from '../../components/TopbarLayout';
import Page from '../../components/Page';

import * as SolresolWorker from '../../workers/music/solresol.worker';
import SolresolOutput, {
  SolresolOutputProps,
} from '../../components/music/SolresolOutput';

const {
  computeSolresolOutput,
  computeEnglishOutput,
} = new (SolresolWorker as any)() as typeof SolresolWorker;

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

const convertToSolresolForm = (
  word: string,
  classes: Record<string, string>,
  type: SolresolWorker.SolresolOutputType,
): ReactNode => {
  switch (type) {
    case 'full':
      return [...word].map((code) => fullSolresolCodes[Number(code)]);
    case 'abbreviated':
      return [...word].map((code) => abbreviatedSolresolCodes[Number(code)]);
    case 'english':
      return [...word].map((code) => englishSolresolCodes[Number(code)]);
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
      // TODO
      return;
  }
};

const Solresol: FunctionComponent<TopbarLayoutProps> = (props) => {
  const [input, setInput] = useState<string>('');
  const [hint, setHint] = useState<string>('');
  const [output, setOutput] = useState<SolresolWorker.TranslationOutput>([]);
  const [outputType, setOutputType] = useState<
    SolresolWorker.SolresolOutputType
  >('full');
  const [swapped, setSwapped] = useState(false);

  const [debouncedInput] = useDebounce(input, 300);

  useEffect(() => {
    const compute = async () => {
      if (!debouncedInput) {
        setHint('');
        setOutput([]);
        return;
      }

      const { output: possibleOutput, hint: possibleHint } = swapped
        ? await computeEnglishOutput(debouncedInput)
        : await computeSolresolOutput(debouncedInput);

      setOutput(possibleOutput);
      setHint(possibleHint !== debouncedInput ? possibleHint : '');
    };

    compute();
  }, [debouncedInput, swapped]);

  const handleSwapClick = useCallback(() => {
    setSwapped((prev) => !prev);
  }, []);

  const handleInput = useCallback<NonNullable<OutlinedInputProps['onInput']>>(
    (event) => {
      setInput((event.target as HTMLTextAreaElement).value);
    },
    [],
  );

  const handleHintClick = useCallback(() => {
    setInput(hint);
  }, [hint]);

  const handleOutputChange = useCallback(
    (output: SolresolWorker.TranslationOutput) => {
      setOutput(output);
    },
    [],
  );

  const handleOutputTypeChange = useCallback<
    NonNullable<SelectProps['onChange']>
  >((event) => {
    setOutputType(event.target.value as SolresolWorker.SolresolOutputType);
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
                  <FormControl>
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
                      {/* <option value="stenographic">Stenographic</option> */}
                    </Select>
                  </FormControl>
                )}
              </Box>
              <SolresolOutput
                value={output}
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
