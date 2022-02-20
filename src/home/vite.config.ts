// TODO: replace this path with @webexp/config/... once Vite
// gets support for transpilation of same-monorepo packages
// See: https://github.com/vitejs/vite/issues/5370
import createConfig from '../config/vite/vanilla';
import { fromYaml } from '../config/utils/yaml';

export default createConfig(async () => ({
  base: '/',
  htmlData: {
    projects: await fromYaml('src/data/projects.yml'),
  },
}));
