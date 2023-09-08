import React, { Fragment, ReactNode } from 'react';
import { styled } from '@mui/material';

export type SolresolType =
  | 'auto'
  | 'full'
  | 'abbreviated'
  | 'english'
  | 'numeric'
  | 'color'
  | 'scale'
  | 'stenographic';

export type SolresolOutputType = Exclude<SolresolType, 'auto'>;
export type SolresolInputType = Exclude<
  SolresolType,
  'color' | 'scale' | 'stenographic'
>;

export const isSolresolOutputType = (
  value: unknown,
): value is SolresolOutputType =>
  [
    'full',
    'abbreviated',
    'english',
    'numeric',
    'color',
    'scale',
    'stenographic',
  ].includes(value as string);
export const isSolresolInputType = (
  value: unknown,
): value is SolresolInputType =>
  ['auto', 'full', 'abbreviated', 'numeric'].includes(value as string);

export const fullSolresolCodes = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si'];
export const abbreviatedSolresolCodes = ['d', 'r', 'm', 'f', 'so', 'l', 's'];
export const englishSolresolCodes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const colorSolresolCodes = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'indigo',
  'violet',
];
export const numericSolresolCodes = Array.from({ length: 7 }, (_, i) =>
  (i + 1).toString(),
);
export const stenographicSolresolCodes = [
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

const mapWordOrPhraseToArray = <T,>(
  wordOrPhrase: (string | number)[],
  arr: T[],
) => wordOrPhrase.map(code => (typeof code === 'string' ? code : arr[code]));

export const ColorTranslation = styled('svg')({
  height: '.8rem',
  borderRadius: '3px',
});

export const ShapeTranslation = styled('svg')(({ theme }) => ({
  borderRadius: '3px',
  stroke: theme.palette.text.primary,
}));

export const convertToSolresolForm = (
  wordOrPhrase: string | string[],
  type: SolresolOutputType,
): ReactNode => {
  const fullWordOrPhrase =
    typeof wordOrPhrase === 'string' ? wordOrPhrase : wordOrPhrase.join(' ');
  const normalizedWordOrPhrase = Array.from(fullWordOrPhrase, char => {
    const numericChar = parseInt(char, 10);
    return Number.isNaN(numericChar) ? char : numericChar - 1;
  });

  switch (type) {
    case 'full': {
      return mapWordOrPhraseToArray(normalizedWordOrPhrase, fullSolresolCodes);
    }
    case 'abbreviated': {
      return mapWordOrPhraseToArray(
        normalizedWordOrPhrase,
        abbreviatedSolresolCodes,
      );
    }
    case 'english': {
      return mapWordOrPhraseToArray(
        normalizedWordOrPhrase,
        englishSolresolCodes,
      );
    }
    case 'numeric': {
      return mapWordOrPhraseToArray(
        normalizedWordOrPhrase,
        numericSolresolCodes,
      );
    }
    case 'color': {
      return (
        <ColorTranslation
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${fullWordOrPhrase.length * 3} 4`}
          role="img"
          aria-labelledby={`${fullWordOrPhrase}-title`}
        >
          <title id={`${fullWordOrPhrase}-title`}>
            {convertToSolresolForm(fullWordOrPhrase, 'full')}
          </title>
          {normalizedWordOrPhrase.map(
            (code, index) =>
              typeof code === 'number' && (
                <rect
                  key={index}
                  width="3"
                  height="4"
                  x={index * 3}
                  y="0"
                  fill={colorSolresolCodes[code]}
                />
              ),
          )}
        </ColorTranslation>
      );
    }
    case 'scale': {
      const includesDo = normalizedWordOrPhrase.includes(0);
      const includesRe = normalizedWordOrPhrase.includes(1);
      const width = fullWordOrPhrase.length * 4;
      const height =
        10 - (!includesDo ? 1 : 0) - (!includesDo && !includesRe ? 1 : 0);
      return (
        <ShapeTranslation
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={`${fullWordOrPhrase}-title`}
          width={`${width * 0.3}rem`}
          height={`${height * 0.3}rem`}
          fill="none"
          stroke="#000"
          strokeWidth={0.2}
        >
          <title id={`${fullWordOrPhrase}-title`}>
            {convertToSolresolForm(fullWordOrPhrase, 'full')}
          </title>
          {normalizedWordOrPhrase.map(
            (code, index) =>
              typeof code === 'number' && (
                <Fragment key={index}>
                  <circle cx={index * 4 + 2} cy={8 - code} r="1" />
                  {code === 0 && (
                    <line x1={index * 4} y1="8" x2={(index + 1) * 4} y2="8" />
                  )}
                </Fragment>
              ),
          )}
          <line x1={0} y1={6} x2={width} y2={6} />
          <line x1={0} y1={4} x2={width} y2={4} />
          <line x1={0} y1={2} x2={width} y2={2} />
        </ShapeTranslation>
      );
    }
    case 'stenographic': {
      let [minX, minY, maxX, maxY] = [0, 0, 0, 0];
      const path = normalizedWordOrPhrase
        .map(code => {
          const { path = 'm 50, 0', area = [0, 0, 50, 0] } =
            typeof code === 'number' ? stenographicSolresolCodes[code] : {};
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
        <ShapeTranslation
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`${minX - 2} ${minY - 2} ${width + 4} ${height + 4}`}
          role="img"
          aria-labelledby={`${fullWordOrPhrase}-title`}
          height={`${height / 50 + 0.1}rem`}
          fill="transparent"
          stroke="#000"
          strokeWidth={4}
        >
          <title id={`${fullWordOrPhrase}-title`}>
            {convertToSolresolForm(fullWordOrPhrase, 'full')}
          </title>
          <path d={`m 0,0 ${path}`} />
        </ShapeTranslation>
      );
    }
  }
};

const inputTypeMap: Record<Exclude<SolresolInputType, 'auto'>, string[]> = {
  full: fullSolresolCodes,
  abbreviated: abbreviatedSolresolCodes,
  english: englishSolresolCodes,
  numeric: numericSolresolCodes,
};
const inputTypeRegexes = Object.fromEntries(
  Object.entries(inputTypeMap).map(([key, values]) => [
    key,
    new RegExp(`(?:${values.join('|')})`, 'gi'),
  ]),
) as Record<Exclude<SolresolInputType, 'auto'>, RegExp>;
const inputTypeDetectionRegexes = Object.fromEntries(
  Object.entries(inputTypeMap).map(([key, values]) => [
    key,
    new RegExp(`^\s*(?:${values.join('|')})`, 'i'),
  ]),
) as Record<Exclude<SolresolInputType, 'auto'>, RegExp>;

export const detectSolresolInputType = (
  input: string,
): Exclude<SolresolInputType, 'auto'> | null =>
  (Object.entries(inputTypeDetectionRegexes).find(([, regex]) =>
    regex.test(input),
  )?.[0] as Exclude<SolresolInputType, 'auto'>) ?? null;

const convertSolresolToken = (
  input: string,
  from: Exclude<SolresolInputType, 'auto'>,
  to: Exclude<SolresolInputType, 'auto'>,
) =>
  from === to ? input : inputTypeMap[to][inputTypeMap[from].indexOf(input)];

export const convertSolresolInput = (
  input: string,
  from: Exclude<SolresolInputType, 'auto'>,
  to: Exclude<SolresolInputType, 'auto'>,
): string => {
  if (from === to) {
    return input;
  }

  inputTypeRegexes[from].lastIndex = 0;
  return Array.from(input.matchAll(inputTypeRegexes[from]))
    .flatMap((match, index, arr) => {
      const prefix = index === 0 ? input.slice(0, match.index!) : undefined;
      const term = convertSolresolToken(match[0], from, to);
      const suffix = input.slice(
        match.index! + match[0].length,
        arr[index + 1]?.index,
      );
      return [...(prefix ? [prefix] : []), term, ...(suffix ? [suffix] : [])];
    })
    .join('');
};
