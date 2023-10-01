import { promises as fs } from 'fs';
import { execute } from '@yarnpkg/shell';
import { render as renderTemplate } from 'ejs';
import { minify as minifyTemplate } from 'html-minifier';

const kebabToCamelCase = str =>
  str.replace(/-([a-z])/g, ([, match]) => match.toUpperCase());

const [projects, apis] = await Promise.all([
  fs.readdir('src/experiments'),
  fs.readdir('src/functions/src/apis'),
]);

await fs.rm('dist', { recursive: true, force: true });

// Build the functions index
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
await execute(
  "yarn workspaces foreach -p --exclude 'web-experiments,@webexp/config' run build",
);

// Move home page to the root dist directory
await fs.rename('src/home/dist/', 'dist/');

// Move each experiment into the root dist directory
await Promise.all(
  projects.map(project =>
    fs.rename(`src/experiments/${project}/dist/`, `dist/${project}/`),
  ),
);

// Build the sitemap
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

console.log('\nFinal build contents:');
await execute("tree --dirsfirst -C -L 2 dist | sed '1d;$d'");
