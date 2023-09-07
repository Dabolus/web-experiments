import Fuse from 'fuse.js';
import nlp from 'compromise';

import solresolDictionary from '../../static/solresol/dictionary.json';

import { setupWorkerServer } from '../utils';

export type SolresolOutputType =
  | 'full'
  | 'abbreviated'
  | 'english'
  | 'numeric'
  | 'color'
  | 'scale'
  | 'stenographic';

export interface TranslationOutputWord {
  word: string;
  meanings: string[];
  comments?: string;
  preferred?: boolean;
}

export interface TranslationOutputItem {
  words: TranslationOutputWord[];
  comments?: string;
}

export type TranslationOutputItems = (string | TranslationOutputItem)[];

export interface DictionaryItem {
  solresol: string;
  english: string[];
  comments?: string;
}

export interface TranslationOutput {
  output: TranslationOutputItems;
  hint?: TranslationOutputItems;
}

export type Translator = (input: string) => Promise<TranslationOutput>;

export interface SolresolWorker {
  computeSolresolOutput: Translator;
  computeEnglishOutput: Translator;
}

const supportedEnglishWords = Array.from(
  new Set(solresolDictionary.flatMap(({ english = [] }) => english)),
).filter(Boolean);
const supportedSolresolWords = Array.from(
  new Set(solresolDictionary.map(({ solresol }) => solresol)),
).filter(Boolean);

const preformattedTag = '\u2061';

const englishMatchRegex = new RegExp(
  `([a-z\\d]+|${preformattedTag}\\d+${preformattedTag})`,
  'gi',
);
const preformattedTagRegex = new RegExp(
  `${preformattedTag}(.+?)${preformattedTag}`,
  'gi',
);
const solresolMatchRegex = /([a-z\d]+)/gi;

const englishFuse = new Fuse<string>(supportedEnglishWords, {
  threshold: 1,
  includeScore: true,
});
const solresolFuse = new Fuse<string>(supportedSolresolWords, {
  threshold: 1,
  includeScore: true,
});

const getPossibleWord = (
  fuse: Fuse<string>,
  word: string,
): string | undefined => {
  const [{ item: possibleWord = undefined } = {}] = fuse
    .search<string>(word)
    .sort((a, b) => {
      const aDiff = Math.abs(a.item.length - word.length);
      const bDiff = Math.abs(b.item.length - word.length);

      if (aDiff === bDiff) {
        return a.score! - b.score!;
      }

      return aDiff - bDiff;
    });
  return possibleWord;
};

const convertTextHintToOutputItems = (
  textHint: string,
): TranslationOutputItems | undefined => {
  if (!textHint.includes(preformattedTag)) {
    return;
  }

  // Split the hint into pieces
  const hint: TranslationOutputItems = [];
  let previousIndex = 0;
  for (
    let matches = preformattedTagRegex.exec(textHint);
    matches !== null;
    matches = preformattedTagRegex.exec(textHint)
  ) {
    const [match, word] = matches;
    hint.push(
      textHint.slice(
        previousIndex,
        preformattedTagRegex.lastIndex - match.length,
      ),
      {
        words: [
          {
            word,
            meanings: [],
          },
        ],
      },
    );
    previousIndex = preformattedTagRegex.lastIndex;
  }
  hint.push(textHint.slice(previousIndex));

  return hint;
};

export const computeSolresolOutput = async (
  input: string,
): Promise<TranslationOutput> => {
  const output: TranslationOutputItems = [];
  let textHint = input;
  let hintOffset = 0;
  const doc = nlp(input);
  doc.verbs().forEach(verb => {
    const [json] = verb.json();
    const { form, tense } = json.verb.grammar;

    const formToSolresolMap: Record<string, string> = {
      // === Simple ===
      imperative: '55', // walk!
      'want-infinitive': '', // he wants to walk, he wanted to walk, he will want to walk
      'gerund-phrase': '', // started looking, starts looking, start looking, will start looking, have started looking, will have started looking

      'simple-present': '', // he walks / we walk
      'simple-past': '11', // he walked
      'simple-future': '33', // he will walk

      // === Progressive ===
      'present-progressive': '', // he is walking
      'past-progressive': '11', // he was walking
      'future-progressive': '33', // he will be walking

      // === Perfect ===
      'present-perfect': '22', // he has walked
      'past-perfect': '22', // he had walked / he had been to see
      'future-perfect': '33', // he will have

      // === Progressive-perfect ===
      'present-perfect-progressive': '22', // he has been walking
      'past-perfect-progressive': '22', // he had been
      'future-perfect-progressive': '33', // will have been

      // ==== Passive ===
      'passive-present': '', // is walked, are stolen, is being walked, has been cleaned
      'passive-past': '22', // got walked, was walked, were walked, was being walked, had been walked, have been eaten
      'passive-future': '33', // will have been walked, will be cleaned

      // === Conditional ===
      'present-conditional': '44', // would walk
      'past-conditional': '44', // would have walked

      // ==== Auxiliary ===
      'auxiliary-future': '33', // going to drink
      'auxiliary-past': '11', // he did walk / he used to walk
      'auxiliary-present': '', // we do walk

      // === modals ===
      'modal-past': '44', // he could have walked
      'modal-infinitive': '', // he can walk

      infinitive: '', // to walk
    };
    const tenses: Record<string, string> = {
      Infinitive: '',
      PastTense: '11',
      PresentTense: '',
      Gerund: '',
      FutureTense: '33',
    };

    const solresol = formToSolresolMap[form] || tenses[tense];

    if (solresol) {
      verb.prepend(`${preformattedTag}${solresol}${preformattedTag}`);
    }
  });
  doc.normalize('heavy');
  doc.toLowerCase();
  // compromise does some weird conversions when there is an abbreviation
  // don't => do do not
  // didn't => do did not
  // won't => do will not
  doc.match('do (do|did|will) not').replace('do not');
  // Solresol does not have indefinite articles
  // NOTE: we need to use the `undefined as any` hack because compromise
  // typings are buggy and require a parameter which should be optional
  doc.match('(a|an)').remove(undefined as any);

  const normalizedInput = doc.text();

  let previousIndex = 0;

  for (
    let matches = englishMatchRegex.exec(normalizedInput);
    matches !== null;
    matches = englishMatchRegex.exec(normalizedInput)
  ) {
    const [word] = matches;

    const translations: DictionaryItem[] =
      word.startsWith(preformattedTag) && word.endsWith(preformattedTag)
        ? [
            solresolDictionary.find(
              ({ solresol }) =>
                solresol ===
                word.slice(preformattedTag.length, -preformattedTag.length),
            ),
          ]
        : solresolDictionary.filter(({ english }) => english?.includes(word));

    if (translations.length > 0) {
      const sortedTranslations = [...translations].sort(
        (a, b) => a.english.indexOf(word) - b.english.indexOf(word),
      );

      const [preferredTranslation, ...otherTranslations] =
        sortedTranslations.map<TranslationOutputWord>(
          ({ solresol: word, english: meanings, comments }) => ({
            word,
            meanings,
            comments,
          }),
        );

      output.push(
        normalizedInput.slice(
          previousIndex,
          englishMatchRegex.lastIndex - word.length,
        ),
        {
          words: [
            {
              ...preferredTranslation,
              preferred: true,
            },
            ...otherTranslations,
          ],
        },
      );

      previousIndex = englishMatchRegex.lastIndex;

      continue;
    } else {
      output.push(
        normalizedInput.slice(previousIndex, englishMatchRegex.lastIndex),
      );

      previousIndex = englishMatchRegex.lastIndex;
    }

    const originalWordIndex = input.search(
      new RegExp(`\\b${word.replace(preformattedTagRegex, '$1')}\\b`, 'gi'),
    );

    if (originalWordIndex < 0) {
      continue;
    }

    const possibleWord = getPossibleWord(englishFuse, word);
    if (possibleWord) {
      textHint = `${textHint.slice(
        0,
        originalWordIndex + hintOffset,
      )}${preformattedTag}${possibleWord}${preformattedTag}${textHint.slice(
        originalWordIndex + word.length + hintOffset,
      )}`;
      hintOffset +=
        possibleWord.length - word.length + preformattedTag.length * 2;
    }
  }

  return { output, hint: convertTextHintToOutputItems(textHint) };
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
): Promise<TranslationOutput> => {
  const inputType = detectSolresolInputType(input);

  const output: TranslationOutputItems = [];
  let textHint = input;

  let previousIndex = 0;
  let hintOffset = 0;

  for (
    let matches = solresolMatchRegex.exec(input);
    matches !== null;
    matches = solresolMatchRegex.exec(input)
  ) {
    const [word] = matches;

    const translation: DictionaryItem = solresolDictionary.find(
      ({ solresol }) => {
        // NOTE: we are doing this conversion for each term because it is much easier,
        // but it would be most probably more performant to convert the input into numeric instead
        const normalizedSolresol =
          inputType === 'numeric'
            ? solresol
            : [...solresol].map(code => inputTypeMap[inputType][code]).join('');

        return normalizedSolresol === word.toLowerCase();
      },
    );

    if (translation) {
      const [preferredTranslation, ...otherTranslations] =
        translation.english.map(word => ({
          word,
          meanings: [],
        }));

      output.push(
        input.slice(previousIndex, solresolMatchRegex.lastIndex - word.length),
        {
          words: [
            {
              ...preferredTranslation,
              preferred: true,
            },
            ...otherTranslations,
          ],
          comments: translation.comments,
        },
      );

      previousIndex = solresolMatchRegex.lastIndex;

      continue;
    } else {
      output.push(input.slice(previousIndex, solresolMatchRegex.lastIndex));

      previousIndex = solresolMatchRegex.lastIndex;
    }

    const possibleWord = getPossibleWord(solresolFuse, word);
    if (possibleWord) {
      textHint = `${textHint.slice(
        0,
        solresolMatchRegex.lastIndex + hintOffset - word.length,
      )}${preformattedTag}${possibleWord}${preformattedTag}${textHint.slice(
        solresolMatchRegex.lastIndex + hintOffset,
      )}`;
      hintOffset +=
        possibleWord.length - word.length + preformattedTag.length * 2;
    }
  }

  return { output, hint: convertTextHintToOutputItems(textHint) };
};

setupWorkerServer<SolresolWorker>({
  computeSolresolOutput,
  computeEnglishOutput,
});
