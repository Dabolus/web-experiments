// TODO: replace this path with @webexp/config/... once Vite
// gets support for transpilation of same-monorepo packages
// See: https://github.com/vitejs/vite/issues/5370
import createConfig from '../../config/vite/vanilla';

const watchMode = !!process.env.WATCH;

export default createConfig({
  outDir: 'wwwroot',
  fileNames: {
    assets: '[name]-[hash][extname]',
  },
  // I have no idea how to set the base path in .NET, so I'm just
  // going to set the base path to the root when in dev mode for now
  ...(watchMode && { base: '/' }),
});
