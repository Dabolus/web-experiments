import type BarcodeDetectorJsqr from 'barcode-detector/dist/BarcodeDetectorJsqr';

export const configureQrCodeDetector = async (): Promise<BarcodeDetector> => {
  const Detector =
    'BarcodeDetector' in window &&
    (await BarcodeDetector.getSupportedFormats()).includes('qr_code')
      ? // If BarcodeDetector exists and supports QR Codes, use it
        BarcodeDetector
      : // Otherwise, lazy load the polyfill and use that instead
        (await import('barcode-detector')).default;

  return new Detector({ formats: ['qr_code'] });
};

const detectorPromise: Promise<BarcodeDetectorJsqr> = configureQrCodeDetector();

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
