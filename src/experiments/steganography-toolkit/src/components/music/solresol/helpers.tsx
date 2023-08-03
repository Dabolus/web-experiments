import React, { ReactNode } from 'react';
import { styled } from '@mui/material';
import type { SolresolOutputType } from '../../../workers/music/solresol.worker';

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

export const ColorTranslation = styled('svg')({
  height: '.8rem',
  borderRadius: '3px',
});

export const StenographicTranslation = styled('svg')(({ theme }) => ({
  borderRadius: '3px',
  fill: 'transparent',
  stroke: theme.palette.text.primary,
  strokeWidth: 4,
}));

export const convertToSolresolForm = (
  word: string,
  type: SolresolOutputType,
): ReactNode => {
  const normalizedWord = Array.from(word, char => Number(char) - 1);
  switch (type) {
    case 'full':
      return normalizedWord.map(code => fullSolresolCodes[code]);
    case 'abbreviated':
      return normalizedWord.map(code => abbreviatedSolresolCodes[code]);
    case 'english':
      return normalizedWord.map(code => englishSolresolCodes[code]);
    case 'numeric':
      return word;
    case 'color':
      return (
        <ColorTranslation
          viewBox={`0 0 ${word.length * 3} 4`}
          role="img"
          aria-labelledby={`${word}-title`}
        >
          <title id={`${word}-title`}>
            {convertToSolresolForm(word, 'full')}
          </title>
          {normalizedWord.map((code, index) => (
            <rect
              key={index}
              width="3"
              height="4"
              x={index * 3}
              y="0"
              fill={colorSolresolCodes[code]}
            />
          ))}
        </ColorTranslation>
      );
    case 'stenographic':
      let [minX, minY, maxX, maxY] = [0, 0, 0, 0];
      const path = normalizedWord
        .map(code => {
          const { path = '', area = [0, 0, 0, 0] } =
            stenographicSolresolCodes[code] || {};
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
        <StenographicTranslation
          viewBox={`${minX - 2} ${minY - 2} ${width + 4} ${height + 4}`}
          role="img"
          aria-labelledby={`${word}-title`}
          height={`${height / 50 + 0.1}rem`}
        >
          <title id={`${word}-title`}>
            {convertToSolresolForm(word, 'full')}
          </title>
          <path d={`m 0,0 ${path}`} />
        </StenographicTranslation>
      );
  }
};
