import {
  PropsWithoutRef,
  RefAttributes,
  RefObject,
  useCallback,
  useRef,
  useState,
} from 'react';
import ABCJS from 'abcjs';
import { saveAs } from 'file-saver';
import { AbcProps } from '../components/music/Abc';
import { setupWorkerClient } from '../workers/utils';
import type {
  EncodeMp3Options,
  MusicExporterWorker,
} from '../workers/music/exporter.worker';

const musicExporterWorker = setupWorkerClient<MusicExporterWorker>(
  new Worker(new URL('../workers/music/exporter.worker.ts', import.meta.url), {
    type: 'module',
  }),
  ['encodeMp3'],
);

export interface UseAudioExporterValue {
  isExporting?: boolean;
  abcRef?: RefObject<HTMLDivElement>;
  getAbcProps(
    props?: Partial<AbcProps>,
  ): PropsWithoutRef<AbcProps> & RefAttributes<HTMLDivElement>;
  exportAbc(title?: string): Promise<void>;
  exportSvg(title?: string): Promise<void>;
  exportWav(title?: string): Promise<void>;
  exportMp3(title?: string, options?: EncodeMp3Options): Promise<void>;
}

export type UseAudioExporterHook = () => UseAudioExporterValue;

const useAudioExporter: UseAudioExporterHook = () => {
  const abcRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [abcRenderOutput, setAbcRenderOutput] = useState<any>();
  const [abcInput, setAbcInput] = useState('');

  const getAbcProps = useCallback<UseAudioExporterValue['getAbcProps']>(
    ({ src, onRender, ...props } = {}) => {
      setAbcInput(src || '');
      return {
        ref: abcRef,
        onRender: output => {
          setAbcRenderOutput(output[0]);
          onRender?.(output);
        },
        src,
        ...props,
      };
    },
    [setAbcRenderOutput],
  );

  const exportAbc = useCallback<UseAudioExporterValue['exportAbc']>(
    async title => {
      setIsExporting(true);
      const blob = new Blob([abcInput], { type: 'text/vnd.abc' });
      saveAs(blob, `${title || 'song'}.abc`);
      setIsExporting(false);
    },
    [abcInput],
  );

  const exportSvg = useCallback<UseAudioExporterValue['exportSvg']>(
    async title => {
      setIsExporting(true);
      const svg = abcRef.current?.querySelector('svg')?.outerHTML;
      if (!svg) {
        return;
      }
      const transformedSvg = svg.replace(
        '<svg',
        '<svg xmlns="http://www.w3.org/2000/svg"',
      );
      const blob = new Blob([transformedSvg], { type: 'image/svg+xml' });
      saveAs(blob, `${title || 'song'}.svg`);
      setIsExporting(false);
    },
    [abcInput],
  );

  const getWavUrl = useCallback(async (): Promise<string> => {
    const audioContext = new AudioContext();
    await audioContext.resume();

    const midiBuffer = new ABCJS.synth.CreateSynth();
    await midiBuffer.init({
      visualObj: abcRenderOutput,
      audioContext,
      millisecondsPerMeasure: abcRenderOutput.millisecondsPerMeasure(),
      options: {
        soundFontUrl: `${import.meta.env.BASE_URL}sounds/`,
        program: 0,
      },
    });
    await midiBuffer.prime();

    return midiBuffer.download();
  }, [abcRenderOutput]);

  const exportWav = useCallback<UseAudioExporterValue['exportWav']>(
    async title => {
      if (!abcRenderOutput) {
        return;
      }

      setIsExporting(true);
      const wavUrl = await getWavUrl();
      saveAs(wavUrl, `${title || 'song'}.wav`);
      setIsExporting(false);
    },
    [abcRenderOutput, getWavUrl],
  );

  const exportMp3 = useCallback<UseAudioExporterValue['exportMp3']>(
    async (title, options) => {
      if (!abcRenderOutput) {
        return;
      }

      setIsExporting(true);
      const wavUrl = await getWavUrl();
      const mp3 = await musicExporterWorker.encodeMp3(wavUrl, options);
      saveAs(mp3, `${title || 'song'}.mp3`);
      setIsExporting(false);
    },
    [abcRenderOutput, getWavUrl],
  );

  return {
    isExporting,
    abcRef,
    getAbcProps,
    exportAbc,
    exportSvg,
    exportWav,
    exportMp3,
  };
};

export default useAudioExporter;
