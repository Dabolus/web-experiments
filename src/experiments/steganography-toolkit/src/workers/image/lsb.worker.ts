import { setupWorkerServer } from '../utils';

export interface EncodeOptions {
  inputImage: ImageData;
  message: Uint8ClampedArray;
  bitsPerChannel?: number;
  useAlphaChannel?: boolean | 'auto';
}

export interface LSBWorker extends Worker {
  encode(options: EncodeOptions): Promise<ImageData>;
}

export const encode: LSBWorker['encode'] = async ({
  inputImage,
  message,
  bitsPerChannel = 1,
  useAlphaChannel = 'auto',
}) => {
  let hasAlpha = useAlphaChannel === true;
  for (
    let i = 3;
    i < inputImage.data.length && !hasAlpha && useAlphaChannel === 'auto';
    i += 4
  ) {
    hasAlpha = inputImage.data[i] < 255;
  }

  const headerData = new Uint8ClampedArray(4);
  const headerView = new DataView(headerData.buffer);
  headerView.setUint32(0, message.length);

  const dataToEncode = new Uint8ClampedArray(
    headerData.length + message.length,
  );
  dataToEncode.set(headerData);
  dataToEncode.set(message, headerData.length);

  // For each bit of data to encode, we need to set the corresponding bit
  // in the image data. We can use the alpha channel if enabled.
  const encodedData = Uint8ClampedArray.from(inputImage.data);
  for (let i = 0; i < dataToEncode.length; i++) {
    const byte = dataToEncode[i];
    for (let j = 0; j < 8 / bitsPerChannel; j++) {
      // Extract the bits group to encode from the data byte (big endian)
      const bitsGroup =
        (byte >> (8 - bitsPerChannel * (j + 1))) & (2 ** bitsPerChannel - 1);
      // Compute the index of the byte in which to encode the bits group
      //                                [R, G, B, A, R, G, B, A, R, G, B, A]
      // With alpha channel enabled:    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11]
      // Without alpha channel enabled: [0, 1, 2,    3, 4, 5,    6, 7, 8   ]
      const fullByteIndex = i * (8 / bitsPerChannel) + j;
      const byteIndex = hasAlpha
        ? // Use the array index as it is
          fullByteIndex
        : // Skip every fourth byte in the array, which represents the alpha channel of each pixel
          fullByteIndex + Math.floor(fullByteIndex / 3);
      // Encode the bits group in the byte of the image data
      // The bitmask is:
      // - 0b11111110 if bitsPerChannel is 1
      // - 0b11111100 if bitsPerChannel is 2
      // - 0b11110000 if bitsPerChannel is 4
      // - 0b00000000 if bitsPerChannel is 8
      const bitMask = 0b11111111 << bitsPerChannel;
      encodedData[byteIndex] = (encodedData[byteIndex] & bitMask) | bitsGroup;
    }
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

setupWorkerServer<LSBWorker>({
  encode,
});
