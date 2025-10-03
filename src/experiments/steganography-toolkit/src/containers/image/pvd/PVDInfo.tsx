import React, { FunctionComponent } from 'react';
import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Page from '../../../components/Page';
import Text from '../../../components/Text';

const PVDInfo: FunctionComponent = () => (
  <Page title="Image - Pixel Value Differencing - Info">
    <section>
      <Text variant="h4">
        What is Pixel Value Differencing (PVD) Steganography?
      </Text>
      <Text>
        <strong>Pixel Value Differencing (PVD)</strong> is a spatial-domain
        steganography technique that hides data by modifying the{' '}
        <em>difference</em> between pairs of neighboring pixel values rather
        than individual least-significant bits. The intuition: large local
        variations (edges/texture) can tolerate larger changes without being
        noticed; flat regions should be modified only a little.
      </Text>

      <Text variant="h4">How does it work?</Text>
      <Text>
        For each eligible pair of bytes (e.g., two consecutive color channels
        when scanning the image), compute their difference{' '}
        <code>
          |Δ| = |p<sub>2</sub> − p<sub>1</sub>|
        </code>
        . Depending on the magnitude of <code>|Δ|</code>, select a range and
        embed a number of bits <code>t</code> accordingly. A common range set
        is:
      </Text>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Range [L, U]</TableCell>
              <TableCell>Capacity (t bits)</TableCell>
              <TableCell>Values</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              { l: 0, u: 7, t: 3 },
              { l: 8, u: 15, t: 3 },
              { l: 16, u: 31, t: 4 },
              { l: 32, u: 63, t: 5 },
              { l: 64, u: 127, t: 6 },
              { l: 128, u: 255, t: 7 },
            ].map(r => (
              <TableRow key={`${r.l}-${r.u}`}>
                <TableCell>
                  <code>
                    [{r.l}, {r.u}]
                  </code>
                </TableCell>
                <TableCell>
                  <code>{r.t}</code>
                </TableCell>
                <TableCell>
                  <code>
                    2^{r.t} = {1 << r.t}
                  </code>{' '}
                  values
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Text>
        To embed a <code>t</code>-bit value <code>m</code> into the pair, force
        the new absolute difference to <code>|Δ′| = L + m</code> for the chosen
        range <code>[L, U]</code>, keeping the sign of the original difference.
        Then choose new pixel values <code>p′</code> and <code>q′</code> such
        that <code>q′ − p′ = Δ′</code> and <code>0 ≤ p′, q′ ≤ 255</code>. This
        tool uses a boundary-safe selection of <code>p′</code> close to the
        original average and computes <code>q′</code> accordingly.
      </Text>

      <Text variant="h5">A practical example</Text>
      <Text>
        Suppose two consecutive bytes in the scan order are <code>p=120</code>{' '}
        and <code>q=130</code>. Their difference is <code>|Δ| = 10</code>, which
        falls in <code>[8, 15]</code>, so <code>t = 3</code> bits can be
        embedded. If we need to embed the bits <code>101</code> (
        <code>m = 5</code>), the new target difference is{' '}
        <code>|Δ′| = 8 + 5 = 13</code>. Keeping the difference positive, one
        valid update is <code>p′ = 119</code>, <code>q′ = 132</code>, giving{' '}
        <code>q′ − p′ = 13</code>.
      </Text>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pair</TableCell>
              <TableCell>Original</TableCell>
              <TableCell>|Δ|</TableCell>
              <TableCell>Range</TableCell>
              <TableCell>t</TableCell>
              <TableCell>Bits (m)</TableCell>
              <TableCell>Target |Δ′|</TableCell>
              <TableCell>New</TableCell>
              <TableCell>|Δ′|</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              {
                orig: [120, 130],
                d: 10,
                range: '[8, 15]',
                t: 3,
                m: '101 (5)',
                target: 13,
                next: [119, 132],
                d2: 13,
              },
              {
                orig: [52, 45],
                d: 7,
                range: '[0, 7]',
                t: 3,
                m: '011 (3)',
                target: 0 + 3,
                // Keep sign negative
                next: [50, 47],
                d2: 47 - 50, // -3
              },
            ].map((r, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <code>({idx + 1})</code>
                </TableCell>
                <TableCell>
                  <code>
                    p={r.orig[0]}, q={r.orig[1]}
                  </code>
                </TableCell>
                <TableCell>
                  <code>{Math.abs(r.d)}</code>
                </TableCell>
                <TableCell>
                  <code>{r.range}</code>
                </TableCell>
                <TableCell>
                  <code>{r.t}</code>
                </TableCell>
                <TableCell>
                  <code>{r.m}</code>
                </TableCell>
                <TableCell>
                  <code>{r.target}</code>
                </TableCell>
                <TableCell>
                  <code>
                    p′={r.next[0]}, q′={r.next[1]}
                  </code>
                </TableCell>
                <TableCell>
                  <code>
                    {Math.abs(typeof r.d2 === 'number' ? r.d2 : r.target)}
                  </code>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Text variant="h5">Why is the maximum “bits per pair” 7?</Text>
      <Text>
        The largest range <code>[128, 255]</code> contains <code>128</code>{' '}
        distinct values, which is exactly <code>2^7</code>. Therefore a single
        pair can encode at most <strong>7 bits</strong>. Allowing 8 would
        require <code>2^8 = 256</code> distinct values for the absolute
        difference in a pair, which isn’t possible within 8-bit pixel bounds
        while preserving the PVD range mapping.
      </Text>

      <Text variant="h5">Message framing</Text>
      <Text>
        Like the LSB tool, this implementation prefixes the concealed data with
        a <strong>32-bit length</strong>. This keeps the header minimal and lets
        the decoder stop precisely after the intended payload without needing
        additional signatures or metadata.
      </Text>

      <Text variant="h5">Strengths and trade‑offs</Text>
      <ul>
        <li>
          <strong>Imperceptibility:</strong> PVD concentrates changes in
          high‑variance regions, typically less noticeable than uniform LSB
          flipping.
        </li>
        <li>
          <strong>Adaptive capacity:</strong> Busy areas allow more bits per
          pair; flat areas embed fewer bits.
        </li>
        <li>
          <strong>Not format‑robust:</strong> Like LSB, it’s a spatial method;
          lossy recompression (e.g., saving to JPEG) can destroy the payload.
        </li>
      </ul>
    </section>
  </Page>
);

export default PVDInfo;
