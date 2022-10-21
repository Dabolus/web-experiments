import { projects, IconFormat, ProjectType } from '@dabolus/portfolio-data';
import { fileURLToPath } from 'url';
import { viteStaticCopy } from 'vite-plugin-static-copy';
// TODO: replace this path with @webexp/config/... once Vite
// gets support for transpilation of same-monorepo packages
// See: https://github.com/vitejs/vite/issues/5370
import createConfig from '../config/vite/vanilla';

export default createConfig(async () => ({
  pwa: {
    injectRegister: null,
    manifest: false,
    strategies: 'generateSW',
    srcDir: 'src',
    workbox: {
      sourcemap: true,
      cleanupOutdatedCaches: true,
      navigateFallback: 'index.html',
      navigateFallbackDenylist: Object.entries(projects)
        .filter(([, project]) => project.link.includes('gga.dev'))
        .map(([id]) => new RegExp(`^/${id}/`)),
      globPatterns: [
        '**/*.{js,html,woff2,css,svg,png,jpg,jpeg,gif,ico,webp,jxl,mp4,webm,ogg,mp3,opus}',
      ],
    },
  },
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
