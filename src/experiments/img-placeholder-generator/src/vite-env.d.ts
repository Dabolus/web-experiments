/// <reference types="vite/client" />

declare module 'primitive/browser.js' {
  export interface Model {
    toSVG(): string;
  }

  export default function (opts: {
    input: string | HTMLImageElement | ImageData;
    output?: string | HTMLCanvasElement;
    numSteps?: number;
    minEnergy?: number;
    shapeAlpha?: number;
    shapeType?:
      | 'triangle'
      | 'ellipse'
      | 'rotated-ellipse'
      | 'rectangle'
      | 'rotated-rectangle'
      | 'random';
    numCandidates?: number;
    numCandidateShapes?: number;
    numCandidateMutations?: number;
    numCandidateExtras?: number;
    onStep?: (model: Model, step: number) => Promise<void>;
    log?: (message?: unknown, ...optionalParams: unknown[]) => void;
  }): Promise<Model>;
}
