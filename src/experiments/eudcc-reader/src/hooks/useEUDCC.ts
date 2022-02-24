import { useCallback, useState } from 'preact/hooks';
import { detectQrCode } from '../utils/detector';
import { extractEUDCCData, EUDCCDataOutput } from '../utils/extractor';

export interface UseEUDCCValue {
  read(video: HTMLVideoElement): Promise<EUDCCDataOutput>;
  output: EUDCCDataOutput | undefined;
}

const waitForVideoStarted = (
  video: HTMLVideoElement,
  timeout = 5000,
): Promise<HTMLVideoElement> =>
  new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout'));
    }, timeout);

    const callback = (): void => {
      if (video.currentTime > 0) {
        clearTimeout(timeoutId);
        requestAnimationFrame(() => resolve(video));
      } else {
        requestAnimationFrame(callback);
      }
    };
    requestAnimationFrame(callback);
  });

const useEUDCC = (): UseEUDCCValue => {
  const [output, setOutput] = useState<EUDCCDataOutput | undefined>(undefined);

  const read = useCallback<UseEUDCCValue['read']>(async video => {
    await waitForVideoStarted(video);
    const qrContent = await detectQrCode(video);
    const eudccDataOutput = await extractEUDCCData(qrContent);

    setOutput(eudccDataOutput);

    return eudccDataOutput;
  }, []);

  return { read, output };
};

export default useEUDCC;
