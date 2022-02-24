declare module '*.scss' {
  const mapping: Record<string, string>;
  export default mapping;
}

declare module 'cbor-web' {
  export * from 'cbor';
}

declare const BarcodeDetector: typeof import('barcode-detector/dist/BarcodeDetector').default;
declare type BarcodeDetector = BarcodeDetector;

interface Window {
  BarcodeDetector: BarcodeDetector;
}

declare module 'barcode-detector' {
  export = BarcodeDetector;
}

declare module 'qr.js' {
  export default function qr(text: string): { modules: boolean[][] };
}
