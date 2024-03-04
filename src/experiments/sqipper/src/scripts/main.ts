import './polyfills.js';
import { generatePlaceholder } from './generate.js';
import { debounce, drawFileToCanvas } from './utils.js';
import type { ShapeType } from 'archaic/browser';

const inputEl = document.querySelector<HTMLLabelElement>('#input')!;
const inputPlaceholderEl =
  inputEl.querySelector<HTMLDivElement>('#input-placeholder')!;
const inputFileEl = inputEl.querySelector<HTMLInputElement>('#input-file')!;
const inputPreviewEl =
  inputEl.querySelector<HTMLCanvasElement>('#input-preview')!;

const outputEl = document.querySelector<HTMLElement>('#output')!;
const outputImg = outputEl.querySelector<HTMLImageElement>('img')!;

const optionsEl = document.querySelector<HTMLElement>('#options')!;
const widthEl = optionsEl.querySelector<HTMLInputElement>('#width')!;
const heightEl = optionsEl.querySelector<HTMLInputElement>('#height')!;
const constrainEl = optionsEl.querySelector<HTMLInputElement>('#constrain')!;
const stepsNumberEl =
  optionsEl.querySelector<HTMLInputElement>('#steps-number')!;
const shapeTypeEl = optionsEl.querySelector<HTMLSelectElement>('#shape-type')!;
const blurStdDevEl =
  optionsEl.querySelector<HTMLInputElement>('#blur-std-dev')!;
const refreshEl = optionsEl.querySelector<HTMLButtonElement>('#refresh')!;
const downloadEl = optionsEl.querySelector<HTMLAnchorElement>('#download')!;

const updateOutput = async (forceRefresh?: boolean) => {
  const placeholder = await generatePlaceholder(inputPreviewEl, {
    width: widthEl.valueAsNumber,
    height: heightEl.valueAsNumber,
    steps: stepsNumberEl.valueAsNumber,
    shapeType: shapeTypeEl.value as ShapeType,
    blurStdDev: blurStdDevEl.valueAsNumber,
    forceRefresh,
  });
  outputImg.src = placeholder;
  downloadEl.href = placeholder;
  optionsEl.removeAttribute('aria-disabled');
};

const handleFileSelect = async (file?: File | null) => {
  if (!file || !file.type.startsWith('image/')) {
    return;
  }
  await drawFileToCanvas(file, inputPreviewEl);
  inputPlaceholderEl.hidden = true;
  inputPreviewEl.hidden = false;
  widthEl.value = Math.round(inputPreviewEl.width / 4).toString();
  heightEl.value = Math.round(inputPreviewEl.height / 4).toString();
  await updateOutput();
};

inputEl.addEventListener('drop', async event => {
  event.preventDefault();
  const droppedItem = event.dataTransfer?.items?.[0];
  if (droppedItem?.kind !== 'file') {
    return;
  }
  const droppedFile = droppedItem.getAsFile();
  await handleFileSelect(droppedFile);
  await updateOutput();
});
inputEl.addEventListener('dragover', e => {
  e.preventDefault();
});
inputFileEl.addEventListener('change', async () => {
  const file = inputFileEl.files?.[0];
  if (!file || !file.type.startsWith('image/')) {
    return;
  }
  await handleFileSelect(file);
});

widthEl.addEventListener(
  'input',
  debounce(async () => {
    if (!widthEl.valueAsNumber) {
      return;
    }
    if (constrainEl.checked) {
      heightEl.value = Math.round(
        (widthEl.valueAsNumber / outputImg.width) * outputImg.height,
      ).toString();
    }
    await updateOutput();
  }, 500),
);

heightEl.addEventListener(
  'input',
  debounce(async () => {
    if (!heightEl.valueAsNumber) {
      return;
    }
    if (constrainEl.checked) {
      widthEl.value = Math.round(
        (heightEl.valueAsNumber / outputImg.height) * outputImg.width,
      ).toString();
    }
    await updateOutput();
  }, 500),
);

stepsNumberEl.addEventListener(
  'input',
  debounce(() => updateOutput(), 500),
);
shapeTypeEl.addEventListener('input', e =>
  updateOutput((e.target as HTMLSelectElement).value === 'random'),
);
blurStdDevEl.addEventListener('input', () => updateOutput());
refreshEl.addEventListener('click', () => updateOutput(true));
