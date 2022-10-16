import React, {
  FunctionComponent,
  useReducer,
  Reducer,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from 'react';

import {
  Grid,
  FormControl,
  FormLabel,
  OutlinedInput,
  makeStyles,
  OutlinedInputProps,
  Box,
  Select,
  SelectProps,
  FormHelperText,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  label: {
    marginBottom: theme.spacing(1),
  },
  meterContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(0.5),
  },
  meterPart: {
    flex: '1 1 auto',
  },
}));

export type MusicalKey =
  // Major
  | 'C#'
  | 'F#'
  | 'B'
  | 'E'
  | 'A'
  | 'D'
  | 'G'
  | 'C'
  | 'F'
  | 'Bb'
  | 'Eb'
  | 'Ab'
  | 'Db'
  | 'Gb'
  | 'Cb'

  // Minor
  | 'A#m'
  | 'D#m'
  | 'G#m'
  | 'C#m'
  | 'F#m'
  | 'Bm'
  | 'Em'
  | 'Am'
  | 'Dm'
  | 'Gm'
  | 'Cm'
  | 'Fm'
  | 'Bbm'
  | 'Ebm'
  | 'Abm';

export type Language = 'en' | 'it';

export interface Cicada3301FormValue {
  input: string;
  title: string;
  meter: [number, number];
  key: MusicalKey | null;
  tempo: number;
  language: Language;
}

export type Cicada3301FormState = {
  [key in keyof Omit<
    Cicada3301FormValue,
    'meter' | 'key' | 'language'
  >]: string;
} & {
  key: MusicalKey | '';
  meterBeats: string;
  meterNoteValue: string;
  language: Language;
};

export enum Cicada3301FormActionType {
  INIT = 'INIT',
  SET_FIELD = 'SET_FIELD',
}

export interface InitCicada3301FormAction {
  type: Cicada3301FormActionType.INIT;
  value: Partial<Cicada3301FormState>;
}

export interface SetFieldCicada3301FormAction<
  F extends keyof Cicada3301FormState = keyof Cicada3301FormState
> {
  type: Cicada3301FormActionType.SET_FIELD;
  field: F;
  value: Cicada3301FormState[F];
}

export type Cicada3301FormAction =
  | InitCicada3301FormAction
  | SetFieldCicada3301FormAction;

export interface Cicada3301FormProps {
  defaultValue?: Cicada3301FormValue;
  onChange?(value: Cicada3301FormValue): void;
}

const reduceCicada3301Form: Reducer<
  Cicada3301FormState,
  Cicada3301FormAction
> = (state, action) => {
  switch (action.type) {
    case Cicada3301FormActionType.INIT:
      return { ...state, ...action.value };
    case Cicada3301FormActionType.SET_FIELD:
      return {
        ...state,
        [action.field]: action.value,
      };
  }
};

const defaultState: Cicada3301FormState = {
  input: '',
  title: '',
  meterBeats: '4',
  meterNoteValue: '4',
  key: '',
  tempo: '90',
  language: 'en',
};

const Cicada3301Form: FunctionComponent<Cicada3301FormProps> = ({
  defaultValue,
  onChange,
}) => {
  const classes = useStyles();

  const initialState: Cicada3301FormState = useMemo(() => {
    const { meter, tempo, key, ...rest } = defaultValue || {};

    return {
      ...defaultState,
      ...(meter && {
        meterBeats: `${meter[0]}`,
        meterNoteValue: `${meter[1]}`,
      }),
      ...(tempo && {
        tempo: `${tempo}`,
      }),
      ...(key && { key }),
      ...rest,
    };
  }, [defaultValue]);

  const [state, dispatch] = useReducer(reduceCicada3301Form, initialState);
  const [isTempoFocused, setIsTempoFocused] = useState(false);

  const createTextFieldInputHandler = useCallback(
    <F extends keyof Cicada3301FormState>(
      field: F,
    ): NonNullable<OutlinedInputProps['onInput']> => (event) => {
      dispatch({
        type: Cicada3301FormActionType.SET_FIELD,
        field,
        value: (event.target as HTMLTextAreaElement | HTMLInputElement).value,
      });
    },
    [],
  );

  const handleKeyChange = useCallback<NonNullable<SelectProps['onChange']>>(
    (event) => {
      dispatch({
        type: Cicada3301FormActionType.SET_FIELD,
        field: 'key',
        value: event.target.value as MusicalKey,
      });
    },
    [],
  );

  const handleLanguageChange = useCallback<
    NonNullable<SelectProps['onChange']>
  >((event) => {
    dispatch({
      type: Cicada3301FormActionType.SET_FIELD,
      field: 'language',
      value: event.target.value as Language,
    });
  }, []);

  useEffect(() => {
    const { meterBeats, meterNoteValue, tempo, key, ...rest } = state;

    onChange?.({
      meter: [parseInt(meterBeats, 10), parseInt(meterNoteValue, 10)],
      tempo: parseInt(tempo, 10),
      key: key || null,
      ...rest,
    });
  }, [onChange, state]);

  const handleTempoFocus = useCallback(() => {
    setIsTempoFocused(true);
  }, []);

  const handleTempoBlur = useCallback(() => {
    setIsTempoFocused(false);
  }, []);

  return (
    <Grid container spacing={3} component="form">
      <Grid item xs={12}>
        <FormControl fullWidth>
          <FormLabel className={classes.label}>Input</FormLabel>
          <OutlinedInput
            multiline
            rows={4}
            value={state.input}
            onInput={createTextFieldInputHandler('input')}
          />
          <FormHelperText>
            Note: only uppercase letters and digits are supported. Lowercase
            letters will be converted to uppercase and special characters will
            be discarded.
          </FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <FormLabel className={classes.label}>Title</FormLabel>
          <OutlinedInput
            value={state.title}
            onInput={createTextFieldInputHandler('title')}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormLabel focused={isTempoFocused} className={classes.label}>
          Meter
        </FormLabel>
        <div className={classes.meterContainer}>
          <OutlinedInput
            type="number"
            inputProps={{ min: 1 }}
            value={state.meterBeats}
            onInput={createTextFieldInputHandler('meterBeats')}
            onFocus={handleTempoFocus}
            onBlur={handleTempoBlur}
            className={classes.meterPart}
          />
          <Box marginX={1}>/</Box>
          <OutlinedInput
            type="number"
            inputProps={{ min: 1 }}
            value={state.meterNoteValue}
            onInput={createTextFieldInputHandler('meterNoteValue')}
            onFocus={handleTempoFocus}
            onBlur={handleTempoBlur}
            className={classes.meterPart}
          />
        </div>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <FormLabel className={classes.label}>Key</FormLabel>
          <Select
            native
            variant="outlined"
            value={state.key}
            onChange={handleKeyChange}
          >
            <option aria-label="None" value="">
              -
            </option>
            <optgroup label="Major">
              <option>C#</option>
              <option>F#</option>
              <option>B</option>
              <option>E</option>
              <option>A</option>
              <option>D</option>
              <option>G</option>
              <option>C</option>
              <option>F</option>
              <option>Bb</option>
              <option>Eb</option>
              <option>Ab</option>
              <option>Db</option>
              <option>Gb</option>
              <option>Cb</option>
            </optgroup>
            <optgroup label="Minor">
              <option>A#m</option>
              <option>D#m</option>
              <option>G#m</option>
              <option>C#m</option>
              <option>F#m</option>
              <option>Bm</option>
              <option>Em</option>
              <option>Am</option>
              <option>Dm</option>
              <option>Gm</option>
              <option>Cm</option>
              <option>Fm</option>
              <option>Bbm</option>
              <option>Ebm</option>
              <option>Abm</option>
            </optgroup>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <FormLabel className={classes.label}>Tempo</FormLabel>
          <OutlinedInput
            type="number"
            inputProps={{ min: 1 }}
            value={state.tempo}
            onInput={createTextFieldInputHandler('tempo')}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <FormLabel className={classes.label}>Language</FormLabel>
          <Select
            native
            variant="outlined"
            value={state.language}
            onChange={handleLanguageChange}
          >
            <option value="en">English (original)</option>
            <option value="it">Italian</option>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default Cicada3301Form;
