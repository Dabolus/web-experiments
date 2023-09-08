import React, { FunctionComponent } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  styled,
} from '@mui/material';
import Page from './Page';
import Text from './Text';
import TopbarLayout, { TopbarLayoutProps } from './TopbarLayout';

const Container = styled('div')(({ theme }) => ({
  padding: 0,
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
}));

const Home: FunctionComponent<TopbarLayoutProps> = props => (
  <TopbarLayout title="Home" {...props}>
    <Container>
      <Page title="Home">
        <section>
          <Text variant="h3">Welcome to Steganography Toolkit</Text>
          <Text variant="h4">What's this?</Text>
          <Text>
            Steganography Toolkit is an app aimed to provide a fast and easy way
            to hide messages in either text, image, audio or video files using
            various steganographic techniques.
          </Text>
          <Text variant="h4">What is steganography?</Text>
          <Text>From Wikipedia:</Text>
          <Text
            variant="quote"
            cite="https://en.wikipedia.org/wiki/Steganography"
          >
            Steganography […] is the practice of concealing a file, message,
            image, or video within another file, message, image, or video. The
            word steganography combines the Greek words steganos (στεγανός),
            meaning "covered, concealed, or protected", and graphein (γράφειν)
            meaning "writing".
          </Text>
          <Text>
            Each steganographic method works and behaves in a completely
            different way and requires a different technique for the hidden
            message to be decrypted.
          </Text>
          <Text variant="h4">What can I use it for?</Text>
          <Text>
            Steganography can be used to exchange secret messages and/or files.
          </Text>
          <Text variant="h4">
            What's the difference between steganography and cryptography?
          </Text>
          <Text>
            Steganography and cryptography work in a quite different way.
            <br />
            This table explains what are the main differences between them:
          </Text>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cryptography</TableCell>
                  <TableCell>Steganography</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Only the secret message is hidden</TableCell>
                  <TableCell>
                    The message, as well as the fact that a secret communication
                    is taking place, is hidden
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    The encrypted message can be seen by anyone, but decrypted
                    only by the recipient
                  </TableCell>
                  <TableCell>
                    The message is hidden so that no one sees it, but can be
                    decrypted by everyone that knows how to
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Might attract interest of unwanted third parties
                  </TableCell>
                  <TableCell>
                    Does not attract attention of unwanted third parties
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Is like keeping your money in the vault of a bank
                  </TableCell>
                  <TableCell>
                    Is like hiding your money in your mattress
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Text>
            To sum up, if you need to exchange really sensitive or secret data
            that might attract attention of third parties, use cryptography. If
            you want to send something secret and you don't expect anyone to
            know that you want to, use steganography.
          </Text>
          <Text variant="h4">
            In which cases is steganography better than cryptography?
          </Text>
          <Text>
            <strong>Never.</strong> Steganography{' '}
            <strong>does not guarantee</strong> that your message won't be read
            by a third party. Use steganography at your own risk.
          </Text>
          <Text variant="h4">So, what can I use steganography for?</Text>
          <Text>
            Steganography might be used to exchange secret messages with your
            friends and/or family or to create IQ tests.
          </Text>
          <Text variant="h4">Ok then. How do I get started?</Text>
          <Text>
            Now that you know exactly whether you should use steganography or
            not, open up the app drawer using the button on the top-left of the
            page and choose your preferred method to get started!
          </Text>
        </section>
      </Page>
    </Container>
  </TopbarLayout>
);

export default Home;
