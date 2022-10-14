import {
  projects,
  ProjectIconFormat,
  ProjectType,
} from '@dabolus/portfolio-data';
// TODO: replace this path with @webexp/config/... once Vite
// gets support for transpilation of same-monorepo packages
// See: https://github.com/vitejs/vite/issues/5370
import createConfig from '../config/vite/vanilla';

export default createConfig(async () => ({
  base: '/',
  htmlData: {
    ProjectIconFormat,
    ProjectType,
    projects: Object.entries(projects).map(([id, project]) => ({
      id,
      ...project,
    })),
  },
}));
