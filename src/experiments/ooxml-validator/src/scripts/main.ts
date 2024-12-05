// @ts-ignore
import { dotnet } from '../_framework/dotnet.js';
import { ValidationErrorType, ValidationError } from './model.js';
import {
  provideFluentDesignSystem,
  fluentButton,
  fluentProgress,
  fluentDataGridCell,
  fluentDataGridRow,
  fluentDataGrid,
  type DataGrid,
} from '@fluentui/web-components';

provideFluentDesignSystem().register(
  fluentButton(),
  fluentProgress(),
  fluentDataGridCell(),
  fluentDataGridRow(),
  fluentDataGrid(),
);

const { getAssemblyExports, getConfig, runMain } = await dotnet.create();

const config = getConfig();
const exports = await getAssemblyExports(config.mainAssemblyName);

const errorTypes: Record<ValidationErrorType, string> = {
  [ValidationErrorType.SCHEMA]: 'Schema validation error',
  [ValidationErrorType.SEMANTIC]: 'Semantic validation error',
  [ValidationErrorType.PACKAGE]: 'Package structure validation error',
  [ValidationErrorType.MARKUP_COMPATIBILITY]:
    'Markup Compatibility validation error',
};

const header = document.querySelector<HTMLElement>('header')!;
const title = header.querySelector<HTMLHeadingElement>('h1')!;
const chooseFileButton =
  document.querySelector<HTMLButtonElement>('#choose-file')!;
const inputContainer = document.querySelector<HTMLFormElement>('#input')!;
const fileInput = document.querySelector<HTMLInputElement>('#file')!;
const output = document.querySelector<HTMLDivElement>('#output')!;

// We do this dynamically based on HTML + CSS so that we don't need to
// change anything on TS side if we add new file formats and/or change colors
// Get the main stylesheet rules
const mainStyleSheet = Array.from(document.styleSheets).find(s => !!s.href)!;
const mainStyleSheetRules = Array.from(mainStyleSheet.cssRules);
// Get the supported input extensions
const supportedExts = fileInput.accept.split(',').map(ext => ext.slice(1));
// Based on the supported extensions, get the corresponding CSS rules
// For each supported extension we expect a CSS rule with the selector `header.ext`
const headerExtStyleRules = mainStyleSheetRules.filter(
  r =>
    r instanceof CSSStyleRule &&
    supportedExts.some(ext => r.selectorText === `header.${ext}`),
) as CSSStyleRule[];
// Create a map of extension to color
const extToColorMap = new Map(
  headerExtStyleRules.map(r => [
    r.selectorText.slice('header'.length + 1),
    r.style.backgroundColor,
  ]),
);
// Get the meta theme color element, which we will update based on the file extension
const metaThemeColor = document.querySelector<HTMLMetaElement>(
  'meta[name="theme-color"]',
)!;

fileInput.addEventListener('change', async () => {
  if (!fileInput.files?.length) {
    return;
  }
  const fileName = fileInput.files[0].name;
  inputContainer.hidden = true;
  output.innerHTML = /* html */ `
    <div id="loading-container">
      <label for="loading">Loading...</label>
      <fluent-progress id="loading"></fluent-progress>
    </div>
  `;
  const readerResult = Promise.withResolvers<ArrayBuffer>();
  const reader = new FileReader();
  reader.onload = e => readerResult.resolve(e.target!.result as ArrayBuffer);
  reader.onerror = readerResult.reject;
  reader.readAsArrayBuffer(fileInput.files[0]);
  const buffer = await readerResult.promise;
  const validationResult = exports.WordprocessingDocumentValidator.Validate(
    fileName,
    new Uint8Array(buffer),
  );
  const parsedValidationResult: ValidationError[] =
    JSON.parse(validationResult);
  const extension = fileName.slice(fileName.lastIndexOf('.') + 1);
  metaThemeColor.content = extToColorMap.get(extension) ?? '#000';
  header.className = extension;
  title.textContent = fileName;
  if (parsedValidationResult.length === 0) {
    output.innerHTML = /* html */ `
      <div style="margin: 35vh auto; text-align: center;">No errors found!</div>
    `;
    return;
  }
  const dataGrid = document.createElement('fluent-data-grid') as DataGrid;
  dataGrid.generateHeader = 'sticky';
  dataGrid.rowsData = parsedValidationResult.map((error, index) => ({
    'Error #': index + 1,
    Description: error.description,
    'Error type': errorTypes[error.errorType],
    ID: error.id,
    Path: error.xPath,
    Part: error.uri,
  }));
  output.innerHTML = '';
  output.appendChild(dataGrid);
  fileInput.value = '';
});
chooseFileButton.addEventListener('click', () => fileInput.click());

// run the C# Main() method and keep the runtime process running and executing further API calls
await runMain();
