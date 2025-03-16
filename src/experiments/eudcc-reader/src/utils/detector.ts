import type { BarcodeDetector as BarcodeDetectorPolyfill } from 'barcode-detector/ponyfill';

export const configureQrCodeDetector =
  async (): Promise<BarcodeDetectorPolyfill> => {
    const Detector =
      'BarcodeDetector' in window &&
      (await BarcodeDetector.getSupportedFormats()).includes('qr_code')
        ? // If BarcodeDetector exists and supports QR Codes, use it
          BarcodeDetector
        : // Otherwise, lazy load the polyfill and use that instead
          (await import('barcode-detector/ponyfill')).BarcodeDetector;

    return new Detector({ formats: ['qr_code'] });
  };

const detectorPromise: Promise<BarcodeDetectorPolyfill> =
  configureQrCodeDetector();

export const detectQrCode = async (
  video: HTMLVideoElement,
): Promise<string> => {
  const detector = await detectorPromise;
  const results = await detector.detect(video);

  if (results.length < 1) {
    return detectQrCode(video);
  }

  const result = results.find(({ format }) => format === 'qr_code');

  if (!result) {
    return detectQrCode(video);
  }

  return result.rawValue as string;
};
