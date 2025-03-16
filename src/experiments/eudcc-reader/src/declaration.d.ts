declare module '*.scss' {
  const mapping: Record<string, string>;
  export default mapping;
}

declare module 'cbor-web' {
  export * from 'cbor';
}

declare const BarcodeDetector: typeof import('barcode-detector/ponyfill').BarcodeDetector;
declare type BarcodeDetector = BarcodeDetector;

interface Window {
  BarcodeDetector: BarcodeDetector;
}

declare module 'qr.js' {
  export default function qr(text: string): { modules: boolean[][] };
}
