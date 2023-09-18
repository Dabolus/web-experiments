import React, { FunctionComponent, Fragment } from 'react';
import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Page from '../../Page';
import Text from '../../Text';

const highlightDiff = (a: string, b: string) => {
  const diffIndex = Array.from(b).findIndex((char, index) => char !== a[index]);
  const [common, diff] = [b.slice(0, diffIndex), b.slice(diffIndex)];
  return (
    <>
      {common}
      <mark>{diff}</mark>
    </>
  );
};

const LSBInfo: FunctionComponent = () => (
  <Page title="Image - Least Significant Bit - Info">
    <section>
      <Text variant="h4">
        What is Least Significant Bit (LSB) Steganography?
      </Text>
      <Text>
        Least Significant Bit (LSB) Steganography is a technique that works by
        changing the least significant bit (or bits) of each pixel color (and
        optionally of the alpha) of a carrier image with the data of a message
        to be concealed.
      </Text>
      <Text variant="h4">What is the Least Significant Bit?</Text>
      <Text>
        The Least Significant Bit is the bit that has the least value in
        comparison to the other bits in a binary number. For example, in the
        binary number <code>1011</code>, the least significant bit is the
        rightmost bit, with a value of <code>1</code>. In other words, the least
        significant bit is the bit that gives the smallest contribution to the
        value of the number and it's the equivalent of the units digit in the
        decimal system.
      </Text>
      <Text variant="h4">How can the LSB be used for Steganography?</Text>
      <Text>
        There are two different approaches to LSB Steganography: one that works
        by substitution (which is the most common one), and one that works by
        addition. In both cases, the idea at the core of the technique is to
        split the message to be concealed into chunk of bit(s) and to encode
        them in the corresponding chunk of bit(s) of the carrier image.
      </Text>
      <Text variant="h5">A practical example</Text>
      <Text>
        Given the letter "K" and an image of two pixels with colors{' '}
        <code>rgb(27,&nbsp;71,&nbsp;112)</code> and{' '}
        <code>rgb(201,&nbsp;123,&nbsp;99)</code>, here is how the two approaches
        would work using two significant bits of the carrier:
      </Text>
      <ul>
        <li>
          Take the ASCII code of the letter "K" (75) in its binary form:{' '}
          <code>01001011</code>
        </li>
        <li>
          Take the first channel (R) of the first pixel in its binary form:{' '}
          <code>00011011</code>
        </li>
        <li>
          Take the first two bits of the message to be concealed:{' '}
          <code>
            <mark>01</mark>000001
          </code>
        </li>
        <li>
          Based on the chosen approach:
          <ul>
            <li>
              <strong>For the substitution approach:</strong> replace the last
              two bits of the channel with the two bits of the message:{' '}
              <code>
                000110<del>11</del>
                <ins>01</ins>
              </code>
            </li>
            <li>
              <strong>For the addition approach:</strong> add the two bits of
              the message to the byte of the channel:{' '}
              <code>
                00011<del>011</del>
                <ins>100</ins>
              </code>
            </li>
          </ul>
        </li>
        <li>
          Repeat the process with the other channels of the first pixel (G and
          B) and optionally with the alpha channel
        </li>
        <li>
          Repeat the process with the following pixels until all the message has
          been concealed
        </li>
      </ul>
      <Text>
        Below is a table that shows the result of the process described above
        with the differences between the original and the modified bits
        highlighted:
      </Text>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pixel</TableCell>
              <TableCell>Bit&nbsp;pair</TableCell>
              <TableCell>Original</TableCell>
              <TableCell>Substitution</TableCell>
              <TableCell>Addition</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              { channelByte: 27, bitPair: 0b01 },
              { channelByte: 71, bitPair: 0b00 },
              { channelByte: 112, bitPair: 0b10 },
              { channelByte: 201, bitPair: 0b11 },
              { channelByte: 123 },
              { channelByte: 99 },
            ].map(({ channelByte, bitPair }, index, arr) => {
              const formattedByte = channelByte.toString(2).padStart(8, '0');
              const substituted =
                typeof bitPair === 'number'
                  ? highlightDiff(
                      formattedByte,
                      ((channelByte & 0b11111100) | bitPair)
                        .toString(2)
                        .padStart(8, '0'),
                    )
                  : formattedByte;
              const added =
                typeof bitPair === 'number'
                  ? highlightDiff(
                      formattedByte,
                      ((channelByte + bitPair) % 256)
                        .toString(2)
                        .padStart(8, '0'),
                    )
                  : formattedByte;
              return (
                <TableRow key={channelByte}>
                  {index % 3 === 0 && (
                    <TableCell rowSpan={3}>
                      <code>
                        rgb({arr[index].channelByte},&nbsp;
                        {arr[index + 1].channelByte},&nbsp;
                        {arr[index + 2].channelByte})
                      </code>
                    </TableCell>
                  )}
                  <TableCell>
                    <code>{bitPair?.toString(2).padStart(2, '0') ?? '-'}</code>
                  </TableCell>
                  <TableCell>
                    <code>{formattedByte}</code>
                  </TableCell>
                  <TableCell>
                    <code>{substituted}</code>
                  </TableCell>
                  <TableCell>
                    <code>{added}</code>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Text>The final result for the two pixels would be:</Text>
      <ul>
        <li>
          <strong>Original:</strong>
          <div>
            <code>rgb(27,&nbsp;71,&nbsp;112)</code>,{' '}
            <code>rgb(201,&nbsp;123,&nbsp;99)</code>
          </div>
        </li>
        <li>
          <strong>With substitution:</strong>
          <div>
            <code>rgb(25,&nbsp;68,&nbsp;114)</code>,{' '}
            <code>rgb(203,&nbsp;123,&nbsp;99)</code>
          </div>
        </li>
        <li>
          <strong>With addition:</strong>
          <div>
            <code>rgb(28,&nbsp;71,&nbsp;114)</code>,{' '}
            <code>rgb(204,&nbsp;123,&nbsp;99)</code>
          </div>
        </li>
      </ul>
    </section>
  </Page>
);

export default LSBInfo;
