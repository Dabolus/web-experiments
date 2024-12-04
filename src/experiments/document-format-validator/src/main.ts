// @ts-ignore
import { dotnet } from './_framework/dotnet.js';
import { ValidationErrorType, ValidationError } from './model.js';

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

const output = document.querySelector<HTMLDivElement>('#output')!;
const fileInput = document.querySelector<HTMLInputElement>('#file')!;

document.querySelector('#file')!.addEventListener('change', async () => {
  output.innerHTML = `
    <label for="loading">Loading...</label>
    <progress id="loading"></progress>
  `;
  if (!fileInput.files?.length) {
    return;
  }
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
  output.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Error #</th>
          <th>Description</th>
          <th>Error type</th>
          <th>ID</th>
          <th>Path</th>
          <th>Part</th>
        </tr>
      </thead>
      <tbody>
        ${parsedValidationResult
          .map(
            (error, index) => `
                <tr>
                  <th scope="row">${index + 1}</td>
                  <td>${error.description}</td>
                  <td>${errorTypes[error.errorType]}</td>
                  <td>${error.id}</td>
                  <td>${error.xPath}</td>
                  <td>${error.uri}</td>
                </tr>
              `,
          )
          .join('')}
      </tbody>
    </table>
  `;
  fileInput.value = '';
});

// run the C# Main() method and keep the runtime process running and executing further API calls
await runMain();
