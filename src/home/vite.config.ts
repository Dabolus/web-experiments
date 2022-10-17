import {
  projects,
  IconFormat,
  ProjectType,
} from '@dabolus/portfolio-data';
import { fileURLToPath } from 'url';
import { viteStaticCopy } from 'vite-plugin-static-copy';
// TODO: replace this path with @webexp/config/... once Vite
// gets support for transpilation of same-monorepo packages
// See: https://github.com/vitejs/vite/issues/5370
import createConfig from '../config/vite/vanilla';

export default createConfig(async () => ({
  base: '/',
  htmlData: {
    ProjectIconFormat: IconFormat,
    ProjectType,
    projects: Object.entries(projects).map(([id, project]) => ({
      id,
      ...project,
    })),
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: fileURLToPath(
            await import.meta.resolve!(
              '@dabolus/portfolio-data/assets/images/projects',
            ),
          ),
          dest: 'assets/images',
        },
      ],
    }),
  ],
}));
