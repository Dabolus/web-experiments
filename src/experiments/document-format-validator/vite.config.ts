// TODO: replace this path with @webexp/config/... once Vite
// gets support for transpilation of same-monorepo packages
// See: https://github.com/vitejs/vite/issues/5370
import createConfig from '../../config/vite/vanilla';

export default createConfig({
  base: '/',
  outDir: 'wwwroot',
  fileNames: {
    assets: '[name]-[hash][extname]',
  },
});
