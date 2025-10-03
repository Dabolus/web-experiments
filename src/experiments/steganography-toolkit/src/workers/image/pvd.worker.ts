import { setupWorkerServer } from '@easy-worker/core';

export interface EncodeOptions {
  inputImage: ImageData;
  message: Uint8ClampedArray;
  bitsPerChannel?: number;
  useAlphaChannel?: boolean | 'auto';
}

export interface DecodeOptions {
  imageWithMessage: ImageData;
  bitsPerChannel?: number;
  useAlphaChannel?: boolean | 'auto';
}

export interface PVDWorker {
  encode(options: EncodeOptions): Promise<ImageData>;
  decode(options: DecodeOptions): Promise<Uint8ClampedArray>;
}

export const encode: PVDWorker['encode'] = async ({
  inputImage,
  message,
  bitsPerChannel = 1,
  useAlphaChannel = 'auto',
}) => {
  // Determine if we can/should use alpha channel
  let hasAlpha = useAlphaChannel === true;
  for (
    let i = 3;
    i < inputImage.data.length && !hasAlpha && useAlphaChannel === 'auto';
    i += 4
  ) {
    hasAlpha = inputImage.data[i] < 255;
  }

  // Prepare bitstream: 32-bit big-endian length header + message bytes
  const headerData = new Uint8ClampedArray(4);
  const headerView = new DataView(headerData.buffer);
  headerView.setUint32(0, message.length);
  const dataToEncode = new Uint8ClampedArray(
    headerData.length + message.length,
  );
  dataToEncode.set(headerData);
  dataToEncode.set(message, headerData.length);

  const encodedData = Uint8ClampedArray.from(inputImage.data);

  // Collect indices that are eligible for embedding (skip alpha when needed)
  const eligibleIndices: number[] = [];
  for (let i = 0; i < encodedData.length; i++) {
    if (!hasAlpha && (i + 1) % 4 === 0) continue; // skip alpha
    eligibleIndices.push(i);
  }

  // PVD ranges (Wu & Tsai): [0,7],[8,15],[16,31],[32,63],[64,127],[128,255]
  const ranges: Array<{ l: number; u: number; t: number }> = [
    { l: 0, u: 7, t: 3 },
    { l: 8, u: 15, t: 3 },
    { l: 16, u: 31, t: 4 },
    { l: 32, u: 63, t: 5 },
    { l: 64, u: 127, t: 6 },
    { l: 128, u: 255, t: 7 },
  ];

  const getRange = (diffAbs: number) => {
    for (const r of ranges) {
      if (diffAbs >= r.l && diffAbs <= r.u) return r;
    }
    return ranges[0];
  };

  // Bit reader from dataToEncode (big-endian within each byte)
  let bitPtr = 0; // counts how many bits consumed overall
  const totalBits = dataToEncode.length * 8;
  const readBits = (n: number): number => {
    let val = 0;
    for (let i = 0; i < n; i++) {
      let bit = 0;
      if (bitPtr < totalBits) {
        const byteIndex = Math.floor(bitPtr / 8);
        const bitIndex = 7 - (bitPtr % 8);
        bit = (dataToEncode[byteIndex] >> bitIndex) & 1;
      }
      bitPtr++;
      val = (val << 1) | bit;
    }
    return val;
  };

  // Embed into a pair with a specific t using boundary-safe recomputation that preserves the new difference.
  const embedInPair = (i1: number, i2: number, t: number): void => {
    const p = encodedData[i1];
    const q = encodedData[i2];
    const d = q - p;
    const dAbs = Math.abs(d);
    const r = getRange(dAbs);
    const tEff = Math.min(r.t, Math.max(1, Math.min(7, t)));
    const m = readBits(tEff); // value to embed
    const targetAbs = r.l + m; // in [r.l, r.u] by construction
    const dPrime = d >= 0 ? targetAbs : -targetAbs;

    // Choose p' within feasible interval to keep pixels in [0,255] and q'-p' = d'
    // Feasible p' range given d': [max(0, -d'), min(255, 255 - d')]
    const low = Math.max(0, -dPrime);
    const high = Math.min(255, 255 - dPrime);
    // Target p' close to both original p and q-d'
    let pPrime = Math.round((p + (q - dPrime)) / 2);
    if (pPrime < low) pPrime = low;
    if (pPrime > high) pPrime = high;
    const qPrime = pPrime + dPrime;

    encodedData[i1] = pPrime;
    encodedData[i2] = qPrime;
  };

  // Iterate eligible indices in pairs
  for (
    let k = 0;
    k + 1 < eligibleIndices.length && bitPtr < totalBits;
    k += 2
  ) {
    const i1 = eligibleIndices[k];
    const i2 = eligibleIndices[k + 1];
    // Determine capacity t for this pair from its current diff, then cap with bitsPerChannel
    const d = encodedData[i2] - encodedData[i1];
    const dAbs = Math.abs(d);
    const r = getRange(dAbs);
    const tCap = Math.min(r.t, Math.max(1, Math.min(7, bitsPerChannel)));
    embedInPair(i1, i2, tCap);
  }

  if (bitPtr < totalBits) {
    throw new Error(
      'Insufficient capacity to encode the entire message using PVD.',
    );
  }

  const outputImage = new ImageData(
    encodedData,
    inputImage.width,
    inputImage.height,
    {
      colorSpace: inputImage.colorSpace,
    },
  );

  return outputImage;
};

export const decode: PVDWorker['decode'] = async ({
  imageWithMessage,
  bitsPerChannel = 1,
  useAlphaChannel = 'auto',
}) => {
  // Determine if we can/should use alpha channel
  let hasAlpha = useAlphaChannel === true;
  for (
    let i = 3;
    i < imageWithMessage.data.length && !hasAlpha && useAlphaChannel === 'auto';
    i += 4
  ) {
    hasAlpha = imageWithMessage.data[i] < 255;
  }

  const data = imageWithMessage.data;
  const eligibleIndices: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (!hasAlpha && (i + 1) % 4 === 0) continue; // skip alpha
    eligibleIndices.push(i);
  }

  const ranges: Array<{ l: number; u: number; t: number }> = [
    { l: 0, u: 7, t: 3 },
    { l: 8, u: 15, t: 3 },
    { l: 16, u: 31, t: 4 },
    { l: 32, u: 63, t: 5 },
    { l: 64, u: 127, t: 6 },
    { l: 128, u: 255, t: 7 },
  ];
  const getRange = (diffAbs: number) => {
    for (const r of ranges) {
      if (diffAbs >= r.l && diffAbs <= r.u) return r;
    }
    return ranges[0];
  };

  // Bit accumulator
  let bitBuffer: number[] = [];
  const pushBits = (value: number, n: number) => {
    for (let i = n - 1; i >= 0; i--) bitBuffer.push((value >> i) & 1);
  };
  const consumeByte = (): number | undefined => {
    if (bitBuffer.length < 8) return undefined;
    let v = 0;
    for (let i = 0; i < 8; i++) v = (v << 1) | bitBuffer.shift()!;
    return v;
  };

  // Stream over pairs, first reconstruct header (4 bytes), then the payload
  const headerBytes: number[] = [];
  let haveHeader = false;
  let messageLength = 0;
  let message: Uint8ClampedArray | null = null;
  let msgWritten = 0;

  for (let k = 0; k + 1 < eligibleIndices.length; k += 2) {
    const i1 = eligibleIndices[k];
    const i2 = eligibleIndices[k + 1];
    const d = data[i2] - data[i1];
    const dAbs = Math.abs(d);
    const r = getRange(dAbs);
    const tCap = Math.min(r.t, Math.max(1, Math.min(7, bitsPerChannel)));
    const m = Math.min(Math.max(dAbs - r.l, 0), (1 << tCap) - 1);
    pushBits(m, tCap);

    // Drain into header first
    while (!haveHeader && bitBuffer.length >= 8) {
      const b = consumeByte()!;
      headerBytes.push(b);
      if (headerBytes.length === 4) {
        const headerView = new DataView(new Uint8Array(headerBytes).buffer);
        messageLength = headerView.getUint32(0);
        message = new Uint8ClampedArray(messageLength);
        haveHeader = true;
        break;
      }
    }

    // Then drain into message
    while (
      haveHeader &&
      message &&
      bitBuffer.length >= 8 &&
      msgWritten < messageLength
    ) {
      message[msgWritten++] = consumeByte()!;
    }

    if (haveHeader && message && msgWritten >= messageLength) {
      break; // done
    }
  }

  if (!haveHeader) {
    throw new Error('Not enough data to read PVD header.');
  }
  if (!message || msgWritten < messageLength) {
    throw new Error('Incomplete PVD payload in the provided image.');
  }

  return message;
};

setupWorkerServer<PVDWorker>({
  encode,
  decode,
});
