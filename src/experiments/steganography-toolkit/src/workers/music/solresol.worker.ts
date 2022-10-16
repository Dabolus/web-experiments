import Fuse from 'fuse.js';

import solresolDictionary from '../../static/solresol/dictionary.json';

const flattenedSolresolDictionary = solresolDictionary.flatMap(
  ({ english = [], ...rest }) =>
    english.map((word: string) => ({ english: word, ...rest })),
);

const wordRegex = /([a-z\d]+)/gi;

const englishFuse = new Fuse<{ solresol: string; english: string }>(
  flattenedSolresolDictionary,
  {
    keys: ['english'],
    includeScore: true,
  },
);

const solresolFuse = new Fuse<{ solresol: string; english: string }>(
  flattenedSolresolDictionary,
  {
    keys: ['solresol'],
    includeScore: true,
  },
);

export type SolresolOutputType =
  | 'full'
  | 'abbreviated'
  | 'english'
  | 'numeric'
  | 'color'
  | 'stenographic';

export interface TranslationOutputItem {
  word: string;
  meanings: string[];
  preferred?: boolean;
}

export type TranslationOutput = (string | TranslationOutputItem[])[];

export interface DictionaryItem {
  solresol: string;
  english: string[];
}

export const computeSolresolOutput = async (
  input: string,
): Promise<{
  output: TranslationOutput;
  hint: string;
}> => {
  const output: TranslationOutput = [];
  let hint = input;

  let previousIndex = 0;
  let hintOffset = 0;

  for (
    let matches = wordRegex.exec(input);
    matches !== null;
    matches = wordRegex.exec(input)
  ) {
    const [word] = matches;

    const translations: DictionaryItem[] = solresolDictionary.filter(
      // TODO: remove this optional chaining when dictionary is completed
      ({ english }) => english?.includes(word.toLowerCase()),
    );

    if (translations.length > 0) {
      const sortedTranslations = [...translations].sort(
        (a, b) =>
          a.english.indexOf(word.toLowerCase()) -
          b.english.indexOf(word.toLowerCase()),
      );

      const [
        preferredTranslation,
        ...otherTranslations
      ] = sortedTranslations.map(({ solresol: word, english: meanings }) => ({
        word,
        meanings,
      }));

      output.push(
        input.slice(previousIndex, wordRegex.lastIndex - word.length),
        [
          {
            ...preferredTranslation,
            preferred: true,
          },
          ...otherTranslations,
        ],
      );

      previousIndex = wordRegex.lastIndex;

      continue;
    } else {
      output.push(input.slice(previousIndex, wordRegex.lastIndex));

      previousIndex = wordRegex.lastIndex;
    }

    const [
      { score = 1, item: { english: possibleWord = undefined } = {} } = {},
    ] = englishFuse.search<{ solresol: string; english: string }>(word);

    if (
      possibleWord &&
      Math.abs(word.length - possibleWord.length) < 3 &&
      score < 0.01
    ) {
      // TODO: decide whether to build an AST with the hint too or to keep it simple
      hint = `${hint.slice(
        0,
        wordRegex.lastIndex + hintOffset - word.length,
      )}${possibleWord}${hint.slice(wordRegex.lastIndex + hintOffset)}`;

      hintOffset += possibleWord.length - word.length;
    }
  }

  return { output, hint };
};

const inputTypeMap = {
  full: [undefined, 'do', 're', 'mi', 'fa', 'sol', 'la', 'si'],
  abbreviated: [undefined, 'd', 'r', 'm', 'f', 'so', 'l', 's'],
};

const detectSolresolInputType = (
  input: string,
): keyof typeof inputTypeMap | 'numeric' => {
  if (/^\s*\d/.test(input)) {
    return 'numeric';
  }

  if (!/^\s*(?:do|re|mi|fa|sol|la|si)/i.test(input)) {
    return 'abbreviated';
  }

  return 'full';
};

export const computeEnglishOutput = async (
  input: string,
): Promise<{
  output: TranslationOutput;
  hint: string;
}> => {
  const inputType = detectSolresolInputType(input);

  const output: TranslationOutput = [];
  let hint = input;

  let previousIndex = 0;
  let hintOffset = 0;

  for (
    let matches = wordRegex.exec(input);
    matches !== null;
    matches = wordRegex.exec(input)
  ) {
    const [word] = matches;

    const translation: DictionaryItem = solresolDictionary.find(
      ({ solresol }) => {
        // NOTE: we are doing this conversion for each term because it is much easier,
        // but it would be most probably more performant to convert the input into numeric instead
        const normalizedSolresol =
          inputType === 'numeric'
            ? solresol
            : [...solresol]
                .map((code) => inputTypeMap[inputType][code])
                .join('');

        return normalizedSolresol === word.toLowerCase();
      },
    );

    if (translation) {
      const [
        preferredTranslation,
        ...otherTranslations
      ] = translation.english?.map((word) => ({
        word,
        meanings: [],
      }));

      output.push(
        input.slice(previousIndex, wordRegex.lastIndex - word.length),
        [
          {
            ...preferredTranslation,
            preferred: true,
          },
          ...otherTranslations,
        ],
      );

      previousIndex = wordRegex.lastIndex;

      continue;
    } else {
      output.push(input.slice(previousIndex, wordRegex.lastIndex));

      previousIndex = wordRegex.lastIndex;
    }

    const [
      { score = 1, item: { solresol: possibleWord = undefined } = {} } = {},
    ] = solresolFuse.search<{ solresol: string; english: string }>(word);

    if (
      possibleWord &&
      Math.abs(word.length - possibleWord.length) < 3 &&
      score < 0.01
    ) {
      // TODO: decide whether to build an AST with the hint too or to keep it simple
      hint = `${hint.slice(
        0,
        wordRegex.lastIndex + hintOffset - word.length,
      )}${possibleWord}${hint.slice(wordRegex.lastIndex + hintOffset)}`;

      hintOffset += possibleWord.length - word.length;
    }
  }

  return { output, hint };
};
