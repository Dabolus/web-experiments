import { setupWorkerServer } from '@easy-worker/core';

export interface GetImageSpectrogramOptions {
  imageData: ImageData;
  density: number;
  duration: number;
  sampleRate?: number;
  minFrequency?: number;
  maxFrequency?: number;
  logarithmic?: boolean;
}

export interface SpectrogramWorker extends Worker {
  getImageSpectrogram(options: GetImageSpectrogramOptions): Promise<Blob>;
}

export interface GetImageSpectrogramProgressMessage {
  type: 'progress';
  phase: 'start' | 'preprocess' | 'process' | 'encode' | 'end';
  progress: number;
}

const sampleBits = 16;

export const getImageSpectrogram: SpectrogramWorker['getImageSpectrogram'] =
  async ({
    imageData,
    density,
    duration,
    sampleRate = 44100,
    minFrequency = 0,
    maxFrequency = sampleRate / 2,
    logarithmic,
  }): Promise<Blob> => {
    postMessage({
      type: 'progress',
      phase: 'start',
      progress: 0,
    });

    const numSamples = Math.round(sampleRate * duration);
    const tmpData = new Array<number>(numSamples);
    const samplesPerPixel = Math.floor(numSamples / imageData.width);
    const frequencyHeight = maxFrequency - minFrequency;
    const heightFactor = logarithmic
      ? Math.log2(frequencyHeight) / imageData.height
      : frequencyHeight / imageData.height;
    let maxFreq = 0;

    let imageMinColorIntensity = 255 * 3;
    let imageMaxColorIntensity = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const red = imageData.data[i];
      const green = imageData.data[i + 1];
      const blue = imageData.data[i + 2];
      const alpha = imageData.data[i + 3];
      const colorsSum = (red + green + blue) * (alpha / 255);
      imageMinColorIntensity = Math.min(imageMinColorIntensity, colorsSum);
      imageMaxColorIntensity = Math.max(imageMaxColorIntensity, colorsSum);

      if (i % (imageData.data.length / 100) === 0) {
        postMessage({
          type: 'progress',
          phase: 'preprocess',
          progress: i / imageData.data.length,
        });
      }
    }

    for (let x = 0; x < numSamples; x++) {
      let result = 0;
      const pixelX = Math.floor(x / samplesPerPixel);

      for (let y = 0; y < imageData.height; y += density) {
        const pixelIndex = (y * imageData.width + pixelX) * 4;
        const red = imageData.data[pixelIndex];
        const green = imageData.data[pixelIndex + 1];
        const blue = imageData.data[pixelIndex + 2];
        const alpha = imageData.data[pixelIndex + 3];
        const colorsSum = (red + green + blue) * (alpha / 255);
        const colorsVolumePercentage =
          ((colorsSum - imageMinColorIntensity) /
            (imageMaxColorIntensity - imageMinColorIntensity)) *
          100;
        const volume = Math.pow(colorsVolumePercentage, 2);
        const freq = logarithmic
          ? Math.pow(2, heightFactor * (imageData.height - y + 1)) +
            minFrequency
          : Math.round(heightFactor * (imageData.height - y + 1)) +
            minFrequency;
        result += Math.floor(volume * Math.cos((freq * 6.28 * x) / sampleRate));
      }

      tmpData[x] = result;

      if (Math.abs(result) > maxFreq) {
        maxFreq = Math.abs(result);
      }

      if (x % (numSamples / 100) === 0) {
        postMessage({
          type: 'progress',
          phase: 'process',
          progress: x / numSamples,
        });
      }
    }

    const maxVolumePositiveValue = Math.pow(2, sampleBits - 1) - 1;
    const data = tmpData.map(byte =>
      Math.round((maxVolumePositiveValue * byte) / maxFreq),
    );

    const numChannels = 1;
    const dataLength = data.length * (sampleBits / 8);
    const buffer = new ArrayBuffer(44 + dataLength);
    const dataView = new DataView(buffer);
    let offset = 0;

    const writeString = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        dataView.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString('RIFF');
    offset += 4;
    dataView.setUint32(offset, 36 + dataLength, true);
    offset += 4;
    writeString('WAVE');
    offset += 4;
    writeString('fmt ');
    offset += 4;
    dataView.setUint32(offset, 16, true);
    offset += 4;
    dataView.setUint16(offset, 1, true);
    offset += 2;
    dataView.setUint16(offset, numChannels, true);
    offset += 2;
    dataView.setUint32(offset, sampleRate, true);
    offset += 4;
    dataView.setUint32(
      offset,
      numChannels * sampleRate * (sampleBits / 8),
      true,
    );
    offset += 4;
    dataView.setUint16(offset, numChannels * (sampleBits / 8), true);
    offset += 2;
    dataView.setUint16(offset, sampleBits, true);
    offset += 2;
    writeString('data');
    offset += 4;
    dataView.setUint32(offset, dataLength, true);
    offset += 4;

    for (const byte of data) {
      for (let i = 0; i < sampleBits / 8; i++) {
        dataView.setInt8(offset, (byte >> (i * 8)) & 0xff);
        offset += 1;
      }

      if (offset % (data.length / 100) === 0) {
        postMessage({
          type: 'progress',
          phase: 'encode',
          progress: offset / data.length,
        });
      }
    }

    const blob = new Blob([dataView], { type: 'audio/x-wav' });

    postMessage({
      type: 'progress',
      phase: 'end',
      progress: 1,
    });

    return blob;
  };

setupWorkerServer<SpectrogramWorker>({
  getImageSpectrogram,
});
