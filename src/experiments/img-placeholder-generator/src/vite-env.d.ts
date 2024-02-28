/// <reference types="vite/client" />

declare module 'primitive/browser.js' {
  export interface Model {
    toSVG(): string;
  }

  export type ShapeType =
    | 'triangle'
    | 'circle'
    | 'ellipse'
    | 'rotated-ellipse'
    | 'rectangle'
    | 'rotated-rectangle'
    | 'random';

  export interface PrimitiveOptions {
    input: string | HTMLImageElement | ImageData;
    output?: string | HTMLCanvasElement;
    numSteps?: number;
    minEnergy?: number;
    shapeAlpha?: number;
    shapeType?: ShapeType;
    numCandidates?: number;
    numCandidateShapes?: number;
    numCandidateMutations?: number;
    numCandidateExtras?: number;
    onStep?: (model: Model, step: number) => Promise<void>;
    log?: (message?: unknown, ...optionalParams: unknown[]) => void;
  }

  declare const primitive: (opts: PrimitiveOptions) => Promise<Model>;

  export default primitive;
}
