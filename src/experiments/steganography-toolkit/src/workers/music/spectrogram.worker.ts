import { setupWorkerServer } from '../utils';

export interface GetImageSpectrogramOptions {
  imageData: ImageData;
  density: number;
  duration: number;
  sampleRate?: number;
  minFrequency?: number;
  maxFrequency?: number;
}

export interface SpectrogramWorker extends Worker {
  getImageSpectrogram(options: GetImageSpectrogramOptions): Promise<Blob>;
}

export const getImageSpectrogram: SpectrogramWorker['getImageSpectrogram'] =
  async ({
    imageData,
    density,
    duration,
    sampleRate = 44100,
    minFrequency = 0,
    maxFrequency = sampleRate / 2,
  }): Promise<Blob> => {
    const tmpData = [];
    const data2 = [];
    const numSamples = Math.round(sampleRate * duration);
    const samplesPerPixel = Math.floor(numSamples / imageData.width);
    const frequencyHeight = maxFrequency - minFrequency;
    const heightFactor = frequencyHeight / imageData.height;
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
          (colorsSum / imageMaxColorIntensity) * 100;
        const volume = Math.pow(colorsVolumePercentage, 2);

        const freq =
          Math.round(heightFactor * (imageData.height - y + 1)) + minFrequency;
        result += Math.floor(volume * Math.cos((freq * 6.28 * x) / sampleRate));
      }

      tmpData.push(result);

      if (Math.abs(result) > maxFreq) {
        maxFreq = Math.abs(result);
      }
    }

    for (const byte of tmpData) {
      data2.push((32767 * byte) / maxFreq);
    }

    const sampleBits = 16;
    const numChannels = 1;

    const dataLength = data2.length * (sampleBits / 8);
    const buffer = new ArrayBuffer(44 + dataLength);
    const data = new DataView(buffer);
    let offset = 0;

    const writeString = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        data.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString('RIFF');
    offset += 4;
    data.setUint32(offset, 36 + dataLength, true);
    offset += 4;
    writeString('WAVE');
    offset += 4;
    writeString('fmt ');
    offset += 4;
    data.setUint32(offset, 16, true);
    offset += 4;
    data.setUint16(offset, 1, true);
    offset += 2;
    data.setUint16(offset, numChannels, true);
    offset += 2;
    data.setUint32(offset, sampleRate, true);
    offset += 4;
    data.setUint32(offset, numChannels * sampleRate * (sampleBits / 8), true);
    offset += 4;
    data.setUint16(offset, numChannels * (sampleBits / 8), true);
    offset += 2;
    data.setUint16(offset, sampleBits, true);
    offset += 2;
    writeString('data');
    offset += 4;
    data.setUint32(offset, dataLength, true);
    offset += 4;

    for (const byte of data2) {
      data.setInt8(offset, byte & 0xff);
      offset += 1;
      data.setInt8(offset, (byte >> 8) & 0xff);
      offset += 1;
    }

    const blob = new Blob([data], { type: 'audio/x-wav' });
    return blob;
  };

setupWorkerServer<SpectrogramWorker>({
  getImageSpectrogram,
});
