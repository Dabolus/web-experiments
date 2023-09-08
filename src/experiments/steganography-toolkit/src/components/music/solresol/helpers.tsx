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
interface StenographicSolresolCode {
  path: string;
  doublePath: string;
  start?: (previousNote?: number) => [number, number];
}
export const stenographicSolresolCodes: StenographicSolresolCode[] = [
  // do
  {
    path: `
      a 25,25 0 1,1 50,0
      a 25,25 0 1,1 -50,0
      m 50, 0
    `,
    doublePath: 'm -50,0 l 50,0',
    start: previousNote => {
      switch (previousNote) {
        case 4:
          return [-7.3, -17.7];
        case 5:
          return [-25, 25];
        case 7:
          return [-7.3, 17.7];
        default:
          return [0, 0];
      }
    },
  },
  // re
  {
    path: `l 0, 50`,
    doublePath: 'm -12.5,-25 l 25,0 m -12.5,25',
  },
  // mi
  {
    path: `a 25,25 0 1,1 50,0`,
    doublePath: 'm -25,-37.5 l 0,25 m 25,12.5',
  },
  // fa
  {
    path: `l 50, 50`,
    doublePath: 'm -37.5,-12.5 l 25,-25 m 12.5,37.5',
    start: previousNote => (previousNote === 1 ? [-7.3, -17.7] : [0, 0]),
  },
  // sol
  {
    path: `l 50, 0`,
    doublePath: 'm -25,-12.5 l 0,25 m 25,-12.5',
  },
  // la
  {
    path: `a 25,25 0 0,0 0,50`,
    doublePath: 'm -37.5,-25 l 25,0 m 12.5,25',
  },
  // si
  {
    path: `l 50, -50`,
    doublePath: 'm -37.5,12.5 l 25,25 m 12.5,-37.5',
    start: previousNote => (previousNote === 1 ? [-7.3, 17.7] : [0, 0]),
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
  stroke: theme.palette.text.primary,
}));

const computePathBoundingBox = (
  path: string,
): Pick<DOMRect, 'x' | 'y' | 'width' | 'height'> => {
  const svgElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg',
  );
  svgElement.setAttribute('width', '0');
  svgElement.setAttribute('height', '0');
  svgElement.setAttribute('viewBox', '0 0 0 0');
  svgElement.setAttribute('style', 'position: absolute');
  const pathElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path',
  );
  pathElement.setAttribute('d', path);
  svgElement.appendChild(pathElement);
  document.body.appendChild(svgElement);
  const boundingBox = pathElement.getBBox();
  document.body.removeChild(svgElement);
  return {
    x: boundingBox.x - 2,
    y: boundingBox.y - 2,
    width: boundingBox.width + 4,
    height: boundingBox.height + 4,
  };
};

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
      const path = normalizedWordOrPhrase
        .map((code, index) => {
          const {
            path = 'm 50,0',
            doublePath = '',
            start = () => [0, 0],
          } = typeof code === 'number' ? stenographicSolresolCodes[code] : {};
          const previousCode = normalizedWordOrPhrase[index - 1];
          const [pathStartX, pathStartY] = start(
            typeof previousCode === 'number' ? previousCode + 1 : undefined,
          );
          const startPath =
            pathStartX !== 0 && pathStartY !== 0
              ? `m ${pathStartX},${pathStartY} `
              : '';
          return `${startPath}${previousCode === code ? doublePath : path}`;
        })
        .join(' ');
      const finalPath = `m 0,0 ${path}`;
      const boundingBox = computePathBoundingBox(finalPath);
      return (
        <ShapeTranslation
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`${boundingBox.x} ${boundingBox.y} ${boundingBox.width} ${boundingBox.height}`}
          role="img"
          aria-labelledby={`${fullWordOrPhrase}-title`}
          width={`${boundingBox.width / 50}rem`}
          height={`${boundingBox.height / 50}rem`}
          fill="transparent"
          stroke="#000"
          strokeWidth={4}
        >
          <title id={`${fullWordOrPhrase}-title`}>
            {convertToSolresolForm(fullWordOrPhrase, 'full')}
          </title>
          {<path d={finalPath} />}
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
  from === to
    ? input
    : inputTypeMap[to][
        inputTypeMap[from].findIndex(
          token => token.toLowerCase() === input.toLowerCase(),
        )
      ];

export const convertSolresolInput = (
  input: string,
  from: Exclude<SolresolInputType, 'auto'>,
  to: Exclude<SolresolInputType, 'auto'>,
): string => {
  if (from === to) {
    return input;
  }

  inputTypeRegexes[from].lastIndex = 0;
  const matches = Array.from(input.matchAll(inputTypeRegexes[from]));
  return [
    input.slice(0, matches[0]?.index),
    ...matches.map((match, index, arr) => {
      const term = convertSolresolToken(match[0], from, to);
      const suffix = input.slice(
        match.index! + match[0].length,
        arr[index + 1]?.index,
      );
      return `${term}${suffix}`;
    }),
  ].join('');
};
