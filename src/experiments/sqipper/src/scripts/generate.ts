import archaic, { type ShapeType } from 'archaic/browser';
import { optimize as svgOptimize } from 'svgo';
import toSafeDataURI from 'mini-svg-data-uri';

const optimize = async (svg: string): Promise<string> => {
  const { data } = svgOptimize(svg, {
    multipass: true,
    floatPrecision: 1,
  });
  return data;
};

const patchSvgGroup = (
  svg: string,
  blurValue: number,
  cssBlur: boolean,
): string => {
  const gStartIndex =
    svg.match(/<path.*?>/)!.index! + svg.match(/<path.*?>/)![0].length;
  const gEndIndex = svg.match(/<\/svg>/)!.index;
  const svgG = `<g filter='${
    cssBlur ? `blur(${blurValue}px)` : 'url(#c)'
  }' fill-opacity='.5'>`;
  return `${svg.slice(0, gStartIndex)}${svgG}${svg.slice(
    gStartIndex,
    gEndIndex,
  )}</g></svg>`;
};

interface PostProcessOptions {
  width: number;
  height: number;
  cssBlur?: boolean;
  blurStdDev?: number;
}

export const postProcess = (
  svg: string,
  { width, height, cssBlur = true, blurStdDev = 12 }: PostProcessOptions,
): string => {
  if (blurStdDev <= 0) {
    return toSafeDataURI(
      svg.replace(
        /(<svg)(.*?)(>)/,
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">`,
      ),
    );
  }
  const hasGroup = /<svg.*?><path.*?><g/.test(svg);
  const blurFilterId = hasGroup ? 'b' : 'c';
  const blurValue = hasGroup ? blurStdDev : (blurStdDev / 12) * 55;
  const newSvg = hasGroup
    ? svg.replace(
        /(<g)/,
        `<g filter="${
          cssBlur ? `blur(${blurValue}px)` : `url(#${blurFilterId})`
        }"`,
      )
    : patchSvgGroup(svg, blurValue, cssBlur);
  const filter = `<filter id="${blurFilterId}"><feGaussianBlur stdDeviation="${blurValue}"/></filter>`;
  const finalSvg = newSvg.replace(
    /(<svg)(.*?)(>)/,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${
      cssBlur ? '' : filter
    }`,
  );
  return toSafeDataURI(finalSvg);
};

export interface GeneratePlaceholderOptions {
  width?: number;
  height?: number;
  steps?: number;
  shapeType?: ShapeType;
  blurStdDev?: number;
  cssBlur?: boolean;
  forceRefresh?: boolean;
}

const placeholdersCache: Record<string, string> = {};

const generateFreshPlaceholder = async (
  inputCanvas: HTMLCanvasElement,
  {
    width = 256,
    height = 256,
    steps = 8,
    shapeType = 'random',
  }: Omit<GeneratePlaceholderOptions, 'blurStdDev' | 'forceRefresh'> = {},
) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(inputCanvas, 0, 0, width, height);

  const model = await archaic({
    input: ctx.getImageData(0, 0, width, height),
    numSteps: steps,
    shapeType,
  });
  const svg = model.toSVG();
  const optimizedSVG = await optimize(svg);
  return optimizedSVG;
};

export const generatePlaceholder = async (
  inputCanvas: HTMLCanvasElement,
  {
    width = 256,
    height = 256,
    steps = 8,
    shapeType = 'random',
    blurStdDev = 12,
    cssBlur = true,
    forceRefresh,
  }: GeneratePlaceholderOptions = {},
) => {
  const cacheKey = [width, height, steps, shapeType].join('-');
  const placeholder =
    (!forceRefresh && placeholdersCache[cacheKey]) ||
    (await generateFreshPlaceholder(inputCanvas, {
      width,
      height,
      steps,
      shapeType,
    }));
  placeholdersCache[cacheKey] = placeholder;
  return postProcess(placeholder, { width, height, blurStdDev, cssBlur });
};
