import { dotnet } from './_framework/dotnet.js';

const { getAssemblyExports, getConfig, runMain } = await dotnet.create();

const config = getConfig();
const exports = await getAssemblyExports(config.mainAssemblyName);

const errorTypes = [
  'Schema validation error',
  'Semantic validation error',
  'Package structure validation error',
  'Markup Compatibility validation error',
];

const output = document.querySelector('#output');

document.querySelector('#file').addEventListener('change', async e => {
  output.innerHTML = `
    <label for="loading">Loading...</label>
    <progress id="loading"></progress>
  `;
  const file = e.target.files[0];
  const readerResult = Promise.withResolvers();
  const reader = new FileReader();
  reader.onload = e => readerResult.resolve(e.target.result);
  reader.onerror = readerResult.reject;
  reader.readAsArrayBuffer(file);
  const buffer = await readerResult.promise;
  const validationResult = exports.WordprocessingDocumentValidator.Validate(
    new Uint8Array(buffer),
  );
  const parsedValidationResult = JSON.parse(validationResult);
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
  e.target.value = '';
});

// run the C# Main() method and keep the runtime process running and executing further API calls
await runMain();
