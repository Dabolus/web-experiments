/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module 'lamejs' {
  export class Mp3Encoder {
    constructor(channels: number, sampleRate: number, kbps: number);
    encodeBuffer(buffer: Int16Array): Int8Array;
    flush(): Int8Array;
  }
}
declare module 'lamejs/src/js/MPEGMode';
declare module 'lamejs/src/js/Lame';
declare module 'lamejs/src/js/BitStream';
