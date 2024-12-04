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

const chooseFileButton =
  document.querySelector<HTMLButtonElement>('#choose-file')!;
const fileInput = document.querySelector<HTMLInputElement>('#file')!;
const output = document.querySelector<HTMLDivElement>('#output')!;

fileInput.addEventListener('change', async () => {
  if (!fileInput.files?.length) {
    return;
  }
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
    new Uint8Array(buffer),
  );
  const parsedValidationResult: ValidationError[] =
    JSON.parse(validationResult);
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
