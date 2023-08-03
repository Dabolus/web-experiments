import React, { FunctionComponent, Fragment } from 'react';
import { styled } from '@mui/material';
import Page from '../../Page';
import Text from '../../Text';
import { convertToSolresolForm } from './helpers';

const MusicalScaleExampleContainer = styled('div')(({ theme }) => ({
  margin: theme.spacing(1, 0),
}));

const StenographicExampleContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  margin: theme.spacing(1, 0),
}));

const testNotes = '1234567';
const testNotesArray = Array.from(testNotes);

const SolresolInfo: FunctionComponent = () => (
  <Page>
    <section>
      <Text variant="h4">What is Solresol?</Text>
      <Text>
        <strong>Solresol</strong> <em>(Solfège: Sol-Re-Sol)</em>, originally
        called <strong>Langue universelle</strong> and then{' '}
        <strong>Langue musicale universelle</strong>, is a constructed language
        devised by François Sudre, beginning in 1827. His major book on it,{' '}
        <em>Langue Musicale Universelle</em>, was published after his death in
        1866, though he had already been publicizing it for some years. Solresol
        enjoyed a brief spell of popularity, reaching its pinnacle with Boleslas
        Gajewski's 1902 publication of <em>Grammaire du Solresol</em>.
      </Text>
      <Text>
        Sudre hoped Solresol would be used to facilitate international
        communication and deliberately made the language very simple, so it
        would be easy to learn, and unlike any natural language to avoid giving
        an advantage to any particular group of people.
      </Text>
      <Text>
        Solresol was the first artificial language to be taken seriously as an
        interlanguage. It is also the first and only musically-based
        interlanguage; or at least the only one to make any headway.
      </Text>
      <Text>
        Solresol has seven syllables based on the Western musical scale:
        <strong>do re mi fa so la si</strong>, though you don't have to be
        familiar with music in order to learn it. Historically, the total number
        of Solresol words is 2,660: 7 words with one syllable, 49 with two
        syllables, 336 with three syllables, and 2.268 with four syllables.
        However, some enthusiasts have started exploring words with five
        syllables, bringing the total number of words to 3,370.
      </Text>
      <Text variant="h4">Communicating with Solresol</Text>
      <Text>
        With the premise of Solresol being a universal language, multiple ways
        of communicating with it have been devised. The most common ones are:
      </Text>
      <ul>
        <li>Speech</li>
        <li>Various forms of writing (see below)</li>
        <li>Sign language</li>
        <li>Singing or playing notes on a musical instrument</li>
        <li>
          Using the colors of the rainbow, one for each syllable:{' '}
          {convertToSolresolForm(testNotes, 'color')}
        </li>
      </ul>
      <Text variant="h5">Written forms</Text>
      <ul>
        <li>
          Latin alphabet:{' '}
          <strong>
            {testNotesArray
              .map(char => convertToSolresolForm(char, 'full'))
              .join(', ')}
          </strong>
        </li>
        <li>
          Latin alphabet without the vowels{' '}
          <em>(except the o of sol to distinguish it from si)</em>:{' '}
          <strong>
            {testNotesArray
              .map(char => convertToSolresolForm(char, 'abbreviated'))
              .join(', ')}
          </strong>
        </li>
        <li>
          English notes:{' '}
          <strong>
            {testNotesArray
              .map(char => convertToSolresolForm(char, 'english'))
              .join(', ')}
          </strong>
        </li>
        <li>
          Numerals:{' '}
          <strong>
            {testNotesArray
              .map(char => convertToSolresolForm(char, 'numeric'))
              .join(', ')}
          </strong>
        </li>
        <li>
          Notes on a musical scale of just three lines:
          <MusicalScaleExampleContainer>
            {convertToSolresolForm(testNotes, 'scale')}
          </MusicalScaleExampleContainer>
        </li>
        <li>
          Using the stenographic script invented by Vincent Gajewski:
          <StenographicExampleContainer>
            {testNotesArray.map(char => (
              <Fragment key={char}>
                {convertToSolresolForm(char, 'stenographic')}
              </Fragment>
            ))}
          </StenographicExampleContainer>
          <em>
            Note: double syllables are indicated with a line through them.
          </em>
        </li>
      </ul>
      <Text variant="h4">Solresol in the context of steganography</Text>
      <Text>
        While Solresol per se is not a steganographic technique, it can be used
        as such because it isn't currently a widely known nor used language and
        it is fairly difficult to detect by a third party—especially when
        exported as an audio file or a music sheet—as the hidden message will
        look like a simple melody.
      </Text>
    </section>
  </Page>
);

export default SolresolInfo;
