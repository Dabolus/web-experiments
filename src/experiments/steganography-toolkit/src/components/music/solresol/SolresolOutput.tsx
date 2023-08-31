import React, {
  FunctionComponent,
  Fragment,
  useCallback,
  MouseEventHandler,
  useState,
  ReactNode,
} from 'react';
import {
  Menu as MuiMenu,
  MenuItem,
  Typography,
  alpha,
  styled,
} from '@mui/material';
import type {
  TranslationOutputItems,
  TranslationOutputItem,
  SolresolOutputType,
} from '../../../workers/music/solresol.worker';

export interface SolresolOutputProps {
  outputType?: SolresolOutputType;
  value?: TranslationOutputItems;
  onChange?(output: TranslationOutputItems): void;
  formatTranslation?(word: string): ReactNode;
}

const Container = styled('div')(({ theme }) => ({
  whiteSpace: 'pre-wrap',
  padding: '16.5px 14px',
  fontSize: '1rem',
  borderRadius: '4px',
  lineHeight: '23px',
  border: `1px solid ${alpha(theme.palette.divider, 0.23)}`,
  height: '9.25rem',
  cursor: 'text',
  overflowX: 'auto',
}));

const Translation = styled('button')<Pick<SolresolOutputProps, 'outputType'>>(
  ({ theme, outputType }) => ({
    appearance: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    borderRadius: '4px',
    background: 'transparent',
    outline: 'none',
    transition: '.3s border-color',
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: outputType === 'color' ? 0 : 0.9,
    ...(outputType === 'color' && { padding: 0 }),

    '&:hover, &:focus': {
      borderColor: theme.palette.text.disabled,
    },
  }),
);

const AlternativeTranslation = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',

  '& > *': {
    whiteSpace: 'normal',
  },
});

const Menu = styled(MuiMenu)({
  '& .MuiMenu-paper': {
    width: 280,
    minHeight: 72,
  },
});

const DisabledMenuItem = styled(MenuItem)({
  pointerEvents: 'none',
});

const SolresolOutput: FunctionComponent<SolresolOutputProps> = ({
  outputType = 'full',
  value,
  onChange,
  formatTranslation = word => word,
}) => {
  const [selectedTranslation, setSelectedTranslation] = useState<{
    index: number;
    anchor: HTMLElement;
  }>();

  const createTranslationClickHandler = useCallback(
    (index: number): MouseEventHandler<HTMLElement> =>
      event => {
        setSelectedTranslation({
          index,
          anchor: event.target as HTMLElement,
        });
      },
    [],
  );

  const handleAlternativeTranslationsMenuClose = useCallback(() => {
    setSelectedTranslation(undefined);
  }, []);

  const createTranslationPreferenceChangeHandler = useCallback(
    (index: number) => () => {
      if (!selectedTranslation || !value || !onChange) {
        return;
      }

      const translation = value[
        selectedTranslation.index
      ] as TranslationOutputItem;

      onChange([
        ...value.slice(0, selectedTranslation.index),
        {
          ...translation,
          words: translation.words.map((word, wordIndex) => ({
            ...word,
            preferred: wordIndex === index,
          })),
        } as TranslationOutputItem,
        ...value.slice(selectedTranslation.index + 1),
      ]);

      handleAlternativeTranslationsMenuClose();
    },
    [
      selectedTranslation,
      onChange,
      value,
      handleAlternativeTranslationsMenuClose,
    ],
  );

  return (
    <>
      <Container>
        {value?.map((part, index) => {
          if (typeof part === 'string') {
            return <Fragment key={index}>{part}</Fragment>;
          }

          return (
            <Translation
              key={index}
              outputType={outputType}
              aria-controls="alternative-translations-menu"
              aria-haspopup="true"
              onClick={createTranslationClickHandler(index)}
            >
              {formatTranslation(
                part.words.find(({ preferred }) => preferred)?.word || '',
              )}
            </Translation>
          );
        })}
      </Container>
      <Menu
        id="alternative-translations-menu"
        anchorEl={selectedTranslation?.anchor}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top',
        }}
        keepMounted
        open={Boolean(selectedTranslation)}
        onClose={handleAlternativeTranslationsMenuClose}
      >
        {value && selectedTranslation && (
          <>
            {(
              value[selectedTranslation.index] as TranslationOutputItem
            ).words.map(({ word, meanings, comments, preferred }, index) => (
              <MenuItem
                key={word}
                selected={preferred}
                onClick={createTranslationPreferenceChangeHandler(index)}
              >
                <AlternativeTranslation>
                  <Typography variant="subtitle1">
                    <strong>{formatTranslation(word)}</strong>
                  </Typography>
                  <Typography variant="caption">
                    {meanings.join(' · ')}
                  </Typography>
                  {comments && (
                    <Typography variant="caption">
                      <em>{comments}</em>
                    </Typography>
                  )}
                </AlternativeTranslation>
              </MenuItem>
            ))}
            {(value[selectedTranslation.index] as TranslationOutputItem)
              .comments && (
              <DisabledMenuItem>
                <AlternativeTranslation>
                  <Typography variant="caption">
                    {
                      (
                        value[
                          selectedTranslation.index
                        ] as TranslationOutputItem
                      ).comments
                    }
                  </Typography>
                </AlternativeTranslation>
              </DisabledMenuItem>
            )}
          </>
        )}
      </Menu>
    </>
  );
};

export default SolresolOutput;
