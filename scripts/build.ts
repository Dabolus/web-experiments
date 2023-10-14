import { promises as fs } from 'node:fs';
import { performance } from 'node:perf_hooks';
import childProcess from 'node:child_process';
import path from 'node:path';
import { render as renderTemplate } from 'ejs';
import { minify as minifyTemplate } from 'html-minifier';
import { globby } from 'globby';

const execute = async (
  command: string,
  options?: childProcess.ExecOptions,
): Promise<{ stdout: string; stderr: string }> =>
  new Promise((resolve, reject) =>
    childProcess.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout: stdout.toString(), stderr: stderr.toString() });
      }
    }),
  );

console.log('Starting build...');
const start = performance.now();

const kebabToCamelCase = str =>
  str.replace(/-([a-z])/g, ([, match]) => match.toUpperCase());

console.log('Gathering projects and APIs...');
const [projects, apis] = await Promise.all([
  fs.readdir('src/experiments'),
  fs.readdir('src/functions/src/apis'),
]);

console.log('Cleaning up previous build...');
await fs.rm('dist', { recursive: true, force: true });

// Build the functions index
console.log('Building functions index...');
const firebaseFunctionsIndex = `import { onRequest } from 'firebase-functions/v2/https';
${apis.map(
  api =>
    `import { handler as ${kebabToCamelCase(
      api,
    )}Handler } from './apis/${api}';\n`,
)}
${apis.map(
  api =>
    `export const ${kebabToCamelCase(
      api,
    )}Api = onRequest({ cors: true }, ${kebabToCamelCase(api)}Handler);\n`,
)}`;

await fs.writeFile('src/functions/src/index.ts', firebaseFunctionsIndex);

// Build all the things
console.log('Building the experiments...');
const { workspaces }: { workspaces: string[] } = JSON.parse(
  await fs.readFile('package.json', 'utf8'),
);
const projectsPackageJsons = await globby(
  workspaces
    .filter(workspace => !workspace.includes('src/config'))
    .map(workspace => path.join(workspace, 'package.json')),
);
await Promise.all(
  projectsPackageJsons.map(async packageJson => {
    const packageDir = path.dirname(packageJson);
    await execute('bun run build', { cwd: packageDir });
  }),
);

// Move home page to the root dist directory
console.log('Preparing the home page...');
await fs.rename('src/home/dist/', 'dist/');

// Move each experiment into the root dist directory
console.log('Preparing the experiments...');
await Promise.all(
  projects.map(project =>
    fs.rename(`src/experiments/${project}/dist/`, `dist/${project}/`),
  ),
);

// Build the sitemap
console.log('Building the sitemap...');
const sitemapTemplatePath = 'src/sitemap.ejs';
const sitemapTemplate = await fs.readFile(sitemapTemplatePath, 'utf8');
const renderedSitemap = await renderTemplate(
  sitemapTemplate,
  {
    baseUrl: 'https://gga.dev',
    now: new Date().toISOString(),
    paths: [
      '/',
      '/choicest-voice/',
      '/eudcc-reader/',
      '/planet-age/',
      '/steganography-toolkit/',
      '/steganography-toolkit/text/unicode/info',
      '/steganography-toolkit/text/unicode/conceal',
      '/steganography-toolkit/text/unicode/reveal',
      '/steganography-toolkit/image/lsb/info',
      '/steganography-toolkit/image/lsb/generate',
      '/steganography-toolkit/image/lsb/conceal',
      '/steganography-toolkit/image/lsb/reveal',
      '/steganography-toolkit/music/solresol/info',
      '/steganography-toolkit/music/solresol/translate',
      '/steganography-toolkit/music/spectrogram/info',
      '/steganography-toolkit/music/spectrogram/generate',
      '/steganography-toolkit/music/cicada-3301-dyads/info',
      '/steganography-toolkit/music/cicada-3301-dyads/conceal',
    ],
  },
  {
    filename: sitemapTemplatePath,
    client: false,
    async: true,
  },
);
const minifiedSitemap = minifyTemplate(renderedSitemap, {
  collapseWhitespace: true,
  keepClosingSlash: true,
});
await fs.writeFile('dist/sitemap.xml', minifiedSitemap, 'utf8');

// Read the Firebase config template
console.log('Generating Firebase configuration...');
const firebaseConfigTemplate = JSON.parse(
  await fs.readFile('firebase.template.json', 'utf8'),
);

// Dynamically add the rules for client-side routing for each project
const firebaseConfig = {
  ...firebaseConfigTemplate,
  hosting: {
    ...firebaseConfigTemplate.hosting,
    rewrites: [
      ...apis.map(api => ({
        source: `/api/${api}/**`,
        function: `${kebabToCamelCase(api)}Api`,
      })),
      ...projects.map(project => ({
        source: `/${project}/**`,
        destination: `/${project}/index.html`,
      })),
      ...(firebaseConfigTemplate.hosting.rewrites || []),
    ],
  },
};

// Write the final Firebase config
await fs.writeFile(
  'firebase.json',
  JSON.stringify(firebaseConfig, null, 2),
  'utf8',
);

const end = performance.now();
console.log(
  `Build completed in \x1b[32m${((end - start) / 1000).toFixed(
    1,
  )}s\x1b[0m!\nFinal build contents:`,
);
const { stdout: tree } = await execute(
  "tree --dirsfirst -C dist | sed '1d;$d' | sed '$d'",
);
console.log(tree);
