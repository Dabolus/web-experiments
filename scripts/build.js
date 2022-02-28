import { promises as fs } from 'fs';
import { execute } from '@yarnpkg/shell';

const projects = await fs.readdir('src/experiments');

await fs.rm('dist', { recursive: true, force: true });

// Build all the things
await execute(
  "yarn workspaces foreach --exclude 'web-experiments,@webexp/config' run build",
);

// Move home page to the root dist directory
await fs.rename('src/home/dist/', 'dist/');

// Move each experiment into the root dist directory
await Promise.all(
  projects.map(project =>
    fs.rename(`src/experiments/${project}/dist/`, `dist/${project}/`),
  ),
);
