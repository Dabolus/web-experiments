import type {
  Language,
  Cicada3301FormValue,
} from '../../components/music/Cicada3301Form';

import { nextPrime } from '../../helpers';

import letterNotesMapping from '../../static/cicada3301/letterNotesMapping.json';

import { Mp3Encoder } from 'lamejs';

// TODO: this code was rushed and needs to be improved

enum TieType {
  NONE,
  OPEN,
  CLOSE,
  OPEN_CLOSE,
}

const getNote = (
  language: Language,
  letter: string,
  length = 1,
  tieType = TieType.NONE,
) => {
  const letterRanking = letterNotesMapping.rankings[language].indexOf(letter);

  const notes = letterNotesMapping.notes[letterRanking];

  return `[${notes.reduce(
    (finalNote, note) =>
      `${finalNote}${
        tieType === TieType.OPEN || tieType === TieType.OPEN_CLOSE ? '(' : ''
      }${note}${
        tieType === TieType.CLOSE || tieType === TieType.OPEN_CLOSE ? ')' : ''
      }${length > 1 ? length : ''}`,
    '',
  )}]`;
};

export const computeAbc = async ({
  input,
  title,
  meter: [meterBeats, meterNoteValue],
  key,
  tempo,
  language,
}: Cicada3301FormValue): Promise<string> => {
  let resultStr = [
    'X: 1\n',
    ...(title ? [`T: ${title}\n`] : []),
    `M: ${meterBeats}/${meterNoteValue}\n`,
    ...(key ? [`K: ${key}\n`] : []),
    'L: 1/4\n',
    `Q: ${tempo}\n`,
  ].join('');

  const words = input
    .replace(/[^a-z0-9 ]/gi, '')
    .toUpperCase()
    .split(/\s+/g);

  let noteIndex = 0;

  const computedAbc = words.reduce((abc, word) => {
    if (!word) {
      return abc;
    }

    const [...letters] = word.slice(0, -1);

    const initialNotes = letters.reduce((str, letter) => {
      str += getNote(language, letter);

      noteIndex++;

      if (!(noteIndex % meterBeats)) {
        str += '|';
      }

      if (!(noteIndex % (4 * meterBeats))) {
        str += '\n';
      }

      return str;
    }, '');

    const lastLetter = word.slice(-1);
    const lastNoteLength = nextPrime(word.length) - word.length + 1;

    // If adding the last note takes us to the next bar, we have to divide the note into parts

    // Available spaces in the current bar
    const availableSpace = meterBeats - (noteIndex % meterBeats);

    // Remaining notes after filling out the available space in the current bar
    const remainingNotes = lastNoteLength - availableSpace;

    // Full bars taken by the last note
    const fullBars = Math.floor(remainingNotes / meterBeats);

    // Remaining notes after filling out all the possible full bars
    const finalNotes = remainingNotes - fullBars * meterBeats;

    let finalAbc = `${abc}${initialNotes}`;

    if (remainingNotes < 1) {
      return `${finalAbc}${getNote(language, lastLetter, lastNoteLength)}`;
    }

    // Fill the available space in the current bar
    finalAbc += `${getNote(
      language,
      lastLetter,
      availableSpace,
      TieType.OPEN,
    )}|`;

    noteIndex += availableSpace;

    if (!(noteIndex % (4 * meterBeats))) {
      finalAbc += '\n';
    }

    // Add all the full bars
    for (let j = 0; j < fullBars; j++) {
      // If we have more full bars to add, or there are some more notes after the final full bar, we have to start a new tie
      const tieType =
        j < fullBars - 1 || finalNotes > 0 ? TieType.OPEN_CLOSE : TieType.CLOSE;

      finalAbc += `${getNote(language, lastLetter, meterBeats, tieType)}|`;

      noteIndex += meterBeats;

      if (!(noteIndex % (4 * meterBeats))) {
        finalAbc += '\n';
      }
    }

    // Add the final notes
    if (finalNotes > 0) {
      finalAbc += getNote(language, lastLetter, finalNotes, TieType.CLOSE);
    }

    return finalAbc;
  }, '');

  return `${resultStr}${computedAbc}`;
};

export const encodeMp3 = async (wavUrl: string): Promise<Blob> => {
  const wavResponse = await fetch(wavUrl);

  const arrayBuffer = await wavResponse.arrayBuffer();

  const int16Array = new Int16Array(arrayBuffer);

  const encoder = new Mp3Encoder(1, 44100, 320);

  const mp3 = [encoder.encodeBuffer(int16Array), encoder.flush()];

  return new Blob(mp3, { type: 'audio/mp3' });
};
