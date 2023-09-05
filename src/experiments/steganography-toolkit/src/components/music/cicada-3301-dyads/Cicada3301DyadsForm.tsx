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
  OutlinedInputProps,
  Box,
  Select,
  SelectProps,
  FormHelperText,
  styled,
} from '@mui/material';

const Label = styled(FormLabel)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const MeterContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(0.5),
}));

const MeterPart = styled(OutlinedInput)({
  flex: '1 1 auto',
});

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

export type Language =
  | 'en'
  | 'fr'
  | 'de'
  | 'es'
  | 'pt'
  | 'eo'
  | 'it'
  | 'tr'
  | 'sv'
  | 'pl'
  | 'nl'
  | 'da'
  | 'is'
  | 'fi'
  | 'cs'
  | 'hu';

export interface Cicada3301DyadsFormValue {
  input: string;
  title: string;
  meter: [number, number];
  key: MusicalKey | null;
  tempo: number;
  language: Language;
}

export type Cicada3301DyadsFormState = {
  [key in keyof Omit<
    Cicada3301DyadsFormValue,
    'meter' | 'key' | 'language'
  >]: string;
} & {
  key: MusicalKey | '';
  meterBeats: string;
  meterNoteValue: string;
  language: Language;
};

export enum Cicada3301DyadsFormActionType {
  INIT = 'INIT',
  SET_FIELD = 'SET_FIELD',
}

export interface InitCicada3301DyadsFormAction {
  type: Cicada3301DyadsFormActionType.INIT;
  value: Partial<Cicada3301DyadsFormState>;
}

export interface SetFieldCicada3301DyadsFormAction<
  F extends keyof Cicada3301DyadsFormState = keyof Cicada3301DyadsFormState,
> {
  type: Cicada3301DyadsFormActionType.SET_FIELD;
  field: F;
  value: Cicada3301DyadsFormState[F];
}

export type Cicada3301DyadsFormAction =
  | InitCicada3301DyadsFormAction
  | SetFieldCicada3301DyadsFormAction;

export interface Cicada3301DyadsFormProps {
  defaultValue?: Cicada3301DyadsFormValue;
  onChange?(value: Cicada3301DyadsFormValue): void;
}

const reduceCicada3301DyadsForm: Reducer<
  Cicada3301DyadsFormState,
  Cicada3301DyadsFormAction
> = (state, action) => {
  switch (action.type) {
    case Cicada3301DyadsFormActionType.INIT:
      return { ...state, ...action.value };
    case Cicada3301DyadsFormActionType.SET_FIELD:
      return {
        ...state,
        [action.field]: action.value,
      };
  }
};

const defaultState: Cicada3301DyadsFormState = {
  input: '',
  title: '',
  meterBeats: '4',
  meterNoteValue: '4',
  key: '',
  tempo: '90',
  language: 'en',
};

const Cicada3301DyadsForm: FunctionComponent<Cicada3301DyadsFormProps> = ({
  defaultValue,
  onChange,
}) => {
  const initialState: Cicada3301DyadsFormState = useMemo(() => {
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

  const [state, dispatch] = useReducer(reduceCicada3301DyadsForm, initialState);
  const [isTempoFocused, setIsTempoFocused] = useState(false);

  const createTextFieldInputHandler = useCallback(
    <F extends keyof Cicada3301DyadsFormState>(
        field: F,
      ): NonNullable<OutlinedInputProps['onInput']> =>
      event => {
        dispatch({
          type: Cicada3301DyadsFormActionType.SET_FIELD,
          field,
          value: (event.target as HTMLTextAreaElement | HTMLInputElement).value,
        });
      },
    [],
  );

  const handleKeyChange = useCallback<NonNullable<SelectProps['onChange']>>(
    event => {
      dispatch({
        type: Cicada3301DyadsFormActionType.SET_FIELD,
        field: 'key',
        value: event.target.value as MusicalKey,
      });
    },
    [],
  );

  const handleLanguageChange = useCallback<
    NonNullable<SelectProps['onChange']>
  >(event => {
    dispatch({
      type: Cicada3301DyadsFormActionType.SET_FIELD,
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
          <Label>Input</Label>
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
          <Label>Title</Label>
          <OutlinedInput
            value={state.title}
            onInput={createTextFieldInputHandler('title')}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Label focused={isTempoFocused}>Meter</Label>
        <MeterContainer>
          <MeterPart
            type="number"
            inputProps={{ min: 1 }}
            value={state.meterBeats}
            onInput={createTextFieldInputHandler('meterBeats')}
            onFocus={handleTempoFocus}
            onBlur={handleTempoBlur}
          />
          <Box marginX={1}>/</Box>
          <MeterPart
            type="number"
            inputProps={{ min: 1 }}
            value={state.meterNoteValue}
            onInput={createTextFieldInputHandler('meterNoteValue')}
            onFocus={handleTempoFocus}
            onBlur={handleTempoBlur}
          />
        </MeterContainer>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <Label>Key</Label>
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
          <Label>Tempo</Label>
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
          <Label>Language</Label>
          <Select
            native
            variant="outlined"
            value={state.language}
            onChange={handleLanguageChange}
          >
            <option value="en">English (original)</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="es">Spanish</option>
            <option value="pt">Portuguese</option>
            <option value="eo">Esperanto</option>
            <option value="it">Italian</option>
            <option value="tr">Turkish</option>
            <option value="sv">Swedish</option>
            <option value="pl">Polish</option>
            <option value="nl">Dutch</option>
            <option value="da">Danish</option>
            <option value="is">Icelandic</option>
            <option value="fi">Finnish</option>
            <option value="cs">Czech</option>
            <option value="hu">Hungarian</option>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default Cicada3301DyadsForm;
