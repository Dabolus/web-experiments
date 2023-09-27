import React, { FunctionComponent, Fragment } from 'react';
import { Link } from '@mui/material';
import Page from '../../../components/Page';
import Text from '../../../components/Text';

const UnicodeInfo: FunctionComponent = () => (
  <Page title="Text - Unicode - Info">
    <section>
      <Text variant="h4">What is Unicode Steganography?</Text>
      <Text>
        <strong>Unicode Steganography</strong> consists in hiding a message into
        a text by encoding it using invisible Unicode characters.
      </Text>
      <Text variant="h4">How it all started</Text>
      <Text>
        The idea of concealing messages into text by using invisible characters
        as a steganographic technique was first proposed by{' '}
        <Link href="" target="snow-author">
          Matthew Kwan
        </Link>{' '}
        in his project called{' '}
        <Link
          href="https://darkside.com.au/snow/index.html"
          target="snow-project"
        >
          SNOW
        </Link>{' '}
        <em>
          (<strong>S</strong>teganographic <strong>N</strong>ature Of{' '}
          <strong>W</strong>hitespace)
        </em>
        . The project was released in 1996 and—given the time period—it was
        ASCII-based. It worked by appending spaces and tabs to the end of lines
        of the original text.
      </Text>
      <Text variant="h4">A more modern approach</Text>
      <Text>
        While the original approach was great, the fact that it only used ASCII
        characters was very limiting, as it the available character set for
        encoding was very limited, plus it was quite easy to detect that there
        was something weird by e.g. simply selecting the text.
      </Text>
      <Text>
        With the spread of Unicode, though, the original idea behind SNOW was
        revisited and improved to make use of the lots of newly available
        zero-width characters. These characters are also invisible when
        selected, making it harder to detect that there is something hidden in
        the text. More specifically, the Unicode characters used for encoding
        are:
      </Text>
      <ul>
        <li>
          <code>U+200B</code> - ZERO WIDTH SPACE
        </li>
        <li>
          <code>U+200C</code> - ZERO WIDTH NON-JOINER
        </li>
        <li>
          <code>U+200D</code> - ZERO WIDTH JOINER
        </li>
        <li>
          <code>U+200E</code> - LEFT-TO-RIGHT MARK
        </li>
        <li>
          <code>U+202A</code> - LEFT-TO-RIGHT EMBEDDING
        </li>
        <li>
          <code>U+202C</code> - POP DIRECTIONAL FORMATTING
        </li>
        <li>
          <code>U+202D</code> - LEFT-TO-RIGHT OVERRIDE
        </li>
        <li>
          <code>U+2062</code> - INVISIBLE TIMES
        </li>
        <li>
          <code>U+2063</code> - INVISIBLE SEPARATOR
        </li>
        <li>
          <code>U+FEFF</code> - ZERO WIDTH NO-BREAK SPACE
        </li>
      </ul>
      <Text>
        The implementation of this page is based on the{' '}
        <Link
          href="https://330k.github.io/misc_tools/unicode_steganography.html"
          target="unicode-project"
        >
          tool
        </Link>{' '}
        implemented by{' '}
        <Link href="https://www.330k.info/" target="unicode-author">
          330k
        </Link>
        .
      </Text>
    </section>
  </Page>
);

export default UnicodeInfo;
