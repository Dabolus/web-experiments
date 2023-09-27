import React, { FunctionComponent } from 'react';
import Page from '../../../components/Page';
import Text from '../../../components/Text';

const SpectrogramInfo: FunctionComponent = () => (
  <Page title="Music - Spectrogram - Info">
    <section>
      <Text variant="h4">What is a spectrogram?</Text>
      <Text>
        A <strong>spectrogram</strong> is a visual representation of the
        spectrum of frequencies of a signal as it varies with time.
      </Text>
      <Text>
        In music, spectrograms are generally represented in a graph with two
        geometric dimensions: one axis represents time, and the other axis
        represents frequency; a third dimension indicating the amplitude (i.e.
        the decibels) of a particular frequency at a particular time is
        represented by the intensity or color of each point in the image.
      </Text>
      <Text>
        The most used graph for spectrograms is a heat map, where the colors
        represent the amplitude of the signal.
      </Text>
      <Text variant="h4">How can spectrograms be used to hide data?</Text>
      <Text>
        Spectrograms can be used to hide images by leveraging a combination of
        sound duration, frequency, and amplitude. In practice, each pixel of the
        image is encoded into sound with the following logic:
      </Text>
      <ul>
        <li>
          The <strong>color</strong> is converted to grayscale and is used as
          the <strong>amplitude</strong> of the sound (the darker the pixel, the
          lower the amplitude and viceversa).
        </li>
        <li>
          The <strong>Y coordinate</strong> of the pixel is used to compute the{' '}
          <strong>frequency</strong> of the sound. The higher the Y coordinate
          (or lower, depending on whether you consider as Y=0 the top-left
          corner or the bottom-left corner of the image), the higher the
          frequency.
        </li>
        <li>
          The <strong>X coordinate</strong> of the pixel is used to decide at
          which <strong>time</strong> the generated sound should be played. The
          higher the X coordinate, the later the sound will be played.
        </li>
      </ul>
      <Text>
        Once the process is completed, the spectrogram of the resulting sound
        will effectively look like the original image (even though it will be in
        grayscale and not pixel-perfect).
      </Text>
      <Text>
        Note that this process can also be used to hide text by converting the
        text into an image and then hiding the resulting image onto the
        spectrogram.
      </Text>
    </section>
  </Page>
);

export default SpectrogramInfo;
