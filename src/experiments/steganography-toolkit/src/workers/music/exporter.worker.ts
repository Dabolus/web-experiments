import { Mp3Encoder } from 'lamejs';
import MPEGMode from 'lamejs/src/js/MPEGMode';
import Lame from 'lamejs/src/js/Lame';
import BitStream from 'lamejs/src/js/BitStream';
import { setupWorkerServer } from '@easy-worker/core';

// lamejs is buggy and refers to these modules globally instead of importing them
(globalThis as any).MPEGMode = MPEGMode;
(globalThis as any).Lame = Lame;
(globalThis as any).BitStream = BitStream;

export interface EncodeMp3Options {
  channels?: number;
  sampleRate?: number;
  kbps?: number;
}

export interface MusicExporterWorker extends Worker {
  encodeMp3(wavUrl: string, options?: EncodeMp3Options): Promise<Blob>;
}

export const encodeMp3: MusicExporterWorker['encodeMp3'] = async (
  wavUrl,
  { channels = 1, sampleRate = 44100, kbps = 320 } = {},
): Promise<Blob> => {
  const wavResponse = await fetch(wavUrl);
  const arrayBuffer = await wavResponse.arrayBuffer();
  const int16Array = new Int16Array(arrayBuffer);
  const encoder = new Mp3Encoder(channels, sampleRate, kbps);
  const mp3 = [encoder.encodeBuffer(int16Array), encoder.flush()];
  return new Blob(mp3, { type: 'audio/mp3' });
};

setupWorkerServer<MusicExporterWorker>({
  encodeMp3,
});
