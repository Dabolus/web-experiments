import { mean } from './utils';

export const calculateLoudness = (dataArray: Uint8Array): number =>
  mean(dataArray) / 255;

/** Visualizes the loudness through the size of a translucent outline. */
export class OutlineLoudnessIndicator {
  private element: HTMLElement;
  private radius: number;

  /**
   * @param {HTMLElement} element
   */
  constructor(element: HTMLElement) {
    this.element = element;
    this.radius = 20;
  }

  /**
   * Shows the loudness outline, until show() or stop() is called.
   * @param {number} loudness in the range [0, 1].
   */
  show(loudness: number) {
    const radius = loudness * this.radius;
    this.element.style.filter = `drop-shadow(0 0 ${radius * 3}px #09f)`;
  }

  /** Hides the loudness outline. */
  hide() {
    this.element.style.filter = 'none';
  }
}

export interface WaveformIndicatorDisplayOptions {
  color?: string;
  play?: boolean;
  onValue?(value: number): void;
}

/** Visualize the loudness with a waveform. */
export class WaveformIndicator {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private x!: number;

  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d')!;
    // Horizontal position in the canvas for drawing the waveform.
    this.reset();
  }

  /** Resets the waveform */
  reset() {
    this.x = 0;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  display(
    source: MediaStream | ArrayBuffer,
    { color, play, onValue }: WaveformIndicatorDisplayOptions = {},
  ): Promise<Uint8Array> {
    return new Promise(async resolve => {
      this.x = 0;
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 32; // Smallest possible FFT size for cheaper computation.
      const sourceNode =
        source instanceof ArrayBuffer
          ? audioCtx.createBufferSource()
          : audioCtx.createMediaStreamSource(source);
      if (source instanceof ArrayBuffer) {
        const audioBuffer = await audioCtx.decodeAudioData(source);
        this.canvas.width = (Math.ceil(audioBuffer.duration * 60) + 4) * 16;
        (sourceNode as AudioBufferSourceNode).buffer = audioBuffer;
      }
      sourceNode.connect(analyser);
      if (play) {
        analyser.connect(audioCtx.destination);
      }
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const chunks: Uint8Array[] = [];

      let stopped = false;
      sourceNode.addEventListener('ended', () => {
        stopped = true;
      });

      const loop = () => {
        if (
          stopped ||
          ('active' in source && !source.active) ||
          this.x >= this.canvas.width - 1
        ) {
          const mergedChunks = new Uint8Array(
            chunks.reduce((sum, chunk) => sum + chunk.length, 0),
          );
          let offset = 0;
          chunks.forEach(chunk => {
            mergedChunks.set(chunk, offset);
            offset += chunk.length;
          });
          resolve(mergedChunks);
          return;
        }
        analyser.getByteFrequencyData(dataArray);
        chunks.push(dataArray);
        const loudness = calculateLoudness(dataArray);
        this.show(loudness, color);
        onValue?.(loudness);
        requestAnimationFrame(loop);
      };

      if ('start' in sourceNode) {
        sourceNode.start();
      }

      loop();
    });
  }

  /**
   * Shows the loudness outline by appending a vertical line to the right.
   *
   * @param {number} loudness in the range [0, 1].
   */
  show(loudness: number, color = 'rgba(0, 0, 0, 0.5)') {
    this.context.fillStyle = color;
    // Append a vertical line on the right of the waveform, that indicates the
    // loudness.
    // this.context.clearRect(this.x, 0, 1, this.canvas.height);
    this.context.fillRect(
      this.x + 2,
      ((1 - loudness) * this.canvas.height) / 2,
      12,
      loudness * this.canvas.height,
    );

    if (this.x < this.canvas.width - 1) {
      this.x += 16;
    }
    this.context.fillStyle = '#000';
  }
}
