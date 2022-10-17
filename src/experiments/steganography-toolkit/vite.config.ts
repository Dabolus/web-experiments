// TODO: replace this path with @webexp/config/... once Vite
// gets support for transpilation of same-monorepo packages
// See: https://github.com/vitejs/vite/issues/5370
import createPreactConfig from '../../config/vite/preact';

export default createPreactConfig({ pwa: true });
