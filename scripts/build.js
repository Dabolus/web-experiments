import { promises as fs } from 'fs';
import { execute } from '@yarnpkg/shell';

const projects = await fs.readdir('src/experiments');

await fs.rm('dist', { recursive: true, force: true });

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
