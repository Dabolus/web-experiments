import primitive from 'primitive/browser.js';
import { optimize as svgOptimize } from 'svgo';
import toSafeDataURI from 'mini-svg-data-uri';

const optimize = async (svg: string): Promise<string> => {
  const { data } = svgOptimize(svg, {
    multipass: true,
    floatPrecision: 1,
  });
  return data;
};

const patchSVGGroup = (svg: string): string => {
  const gStartIndex =
    svg.match(/<path.*?>/)!.index! + svg.match(/<path.*?>/)![0].length;
  const gEndIndex = svg.match(/<\/svg>/)!.index;
  const svgG = `<g filter='url(#c)' fill-opacity='.5'>`;
  return `${svg.slice(0, gStartIndex)}${svgG}${svg.slice(
    gStartIndex,
    gEndIndex,
  )}</g></svg>`;
};

interface PostProcessOptions {
  width: number;
  height: number;
}

const postProcess = (
  svg: string,
  { width, height }: PostProcessOptions,
): string => {
  let blurStdDev = 12;
  let blurFilterId = 'b';
  let newSVG;

  if (svg.match(/<svg.*?><path.*?><g/) === null) {
    blurStdDev = 55;
    newSVG = patchSVGGroup(svg);
    blurFilterId = 'c';
  } else {
    newSVG = svg.replace(/(<g)/, `<g filter="url(#${blurFilterId})"`);
  }
  const filter = `<filter id="${blurFilterId}"><feGaussianBlur stdDeviation="${blurStdDev}"/></filter>`;
  const finalSVG = newSVG.replace(
    /(<svg)(.*?)(>)/,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${filter}`,
  );
  return toSafeDataURI(finalSVG);
};

export interface GeneratePlaceholderOptions {
  width?: number;
  height?: number;
}

export const generatePlaceholder = async (
  inputCanvas: HTMLCanvasElement,
  { width = 256, height = 256 }: GeneratePlaceholderOptions = {},
) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(inputCanvas, 0, 0, width, height);

  const model = await primitive({
    input: ctx.getImageData(0, 0, width, height),
    numSteps: 8,
    shapeType: 'random',
  });
  const svg = model.toSVG();
  const optimizedSVG = await optimize(svg);
  return postProcess(optimizedSVG, { width, height });
};
