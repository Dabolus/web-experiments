import React, { FunctionComponent } from 'react';
import Page from '../../Page';
import Text from '../../Text';

const Cicada3301DyadsInfo: FunctionComponent = () => (
  <Page>
    <section>
      <Text variant="h4">What is Cicada 3301?</Text>
      <Text>
        <strong>Cicada 3301</strong> is a nickname given to three sets of
        puzzles posted under the name "3301" online between 2012 and 2014. This
        started on January 2, 2012 and ran for nearly a month. A second round of
        puzzles began one year later on January 4, 2013, and then a third round
        following the confirmation of a fresh clue posted on Twitter on January
        4, 2014. The third puzzle has yet to be solved. The stated intent was to
        recruit "intelligent individuals" by presenting a series of puzzles to
        be solved; no new puzzles were published on January 4, 2015. A new clue
        was posted on Twitter on January 5, 2016. Cicada 3301 posted their last
        verified OpenPGP-signed message in April 2017, denying the validity of
        any unsigned puzzle.
      </Text>
      <Text>
        The puzzles focused heavily on data security, cryptography,
        steganography, and internet anonymity. It has been called "the most
        elaborate and mysterious puzzle of the internet age", and is listed as
        one of the "top 5 eeriest, unsolved mysteries of the internet" by The
        Washington Post, and much speculation exists as to its function. Many
        have speculated that the puzzles are a recruitment tool for the NSA,
        CIA, MI6, a "Masonic conspiracy", or a cyber mercenary group. Others
        have stated Cicada 3301 is an alternate reality game, although no
        company or individual has attempted to monetize it. Some of the final
        contestants believe that Cicada 3301 is a remnant of the late 1980s and
        1990s Cypherpunk movement.
      </Text>
      <Text variant="h4">Cicada 3301 and music steganography</Text>
      <Text>
        Many of the puzzles shared by Cicada 3301 involve music steganography.
        In particular, some of these puzzles published between 2016 and 2017
        involved songs formed by a series of dyads (pairs of notes).
      </Text>
      <Text variant="h4">How does it work?</Text>
      <Text>
        Each alphanumeric character is assigned a dyad. The dyads are not
        alphabetical, but in order of the most commonly used English letters
        (ETAOIN etc.). Then, at the end, there are the numerals 0-9. This very
        smart choice allows the most used letters to correspond with the most
        used intervals (smaller intervals being more common than large ones),
        meaning that a typical (English) word will sound more "melodic".
      </Text>
      <Text>
        Each dyad lasts 1 beat, but to distinguish between different words, the
        last note of each word lasts the number of beats required to make the
        total number of beats of that word a prime number. For example, the word
        "stego" has 5 letters in it and the smallest prime number greater than 5
        is 7, so the last note will last 3 beats:
      </Text>
      <Text sx={{ fontFamily: 'math', textAlign: 'center' }}>
        {Array.from('steg', c => (
          <>
            1<sub>{c}</sub> +{' '}
          </>
        ))}
        3<sub>o</sub> = 7
      </Text>
      <Text>
        Since in Cicada 3301 puzzles the dyads were sometimes in another pitch
        than the original song, this tool allows you to choose also a key for
        the generated song. Additionally, it also allows to select things that
        were not present in the original puzzles, such as the meter and the
        tempo, plus the language of the message, that will allow to encode the
        message using the most used letters of that language instead of the
        English ones.
      </Text>
    </section>
  </Page>
);

export default Cicada3301DyadsInfo;
