import { basename } from 'path';
import { promises as fs } from 'fs';
import { defineConfig, UserConfig, Plugin } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { plugin as markdownPlugin, Mode } from 'vite-plugin-markdown';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';
import yaml from '@rollup/plugin-yaml';
import tree from './plugins/tree';

export interface DefineConfigOptions {
  base?: UserConfig['base'];
  plugins?: UserConfig['plugins'];
  htmlData?: Record<string, any> | Promise<Record<string, any>>;
  pwa?: boolean | Partial<VitePWAOptions>;
}

export type DefineConfigOptionsCallback = () =>
  | DefineConfigOptions
  | Promise<DefineConfigOptions>;

const getVitePWAOptions = async (
  pwaOptions: NonNullable<DefineConfigOptions['pwa']>,
): Promise<Partial<VitePWAOptions>> => {
  if (typeof pwaOptions !== 'boolean') {
    return pwaOptions;
  }

  const swSrcExists = await fs
    .stat('src/sw.ts')
    .then(() => true)
    .catch(() => false);

  return {
    injectRegister: null,
    manifest: false,
    strategies: swSrcExists ? 'injectManifest' : 'generateSW',
    srcDir: 'src',
    filename: 'sw.ts',
    workbox: {
      sourcemap: true,
      globPatterns: [
        '**/*.{js,html,woff2,css,svg,png,jpg,jpeg,gif,ico,webp,jxl,mp4,webm,ogg,mp3,opus}',
      ],
    },
  };
};

const createConfig = async (
  options?: DefineConfigOptions | DefineConfigOptionsCallback,
) => {
  const projectPath = process.cwd();
  const {
    base = `/${basename(projectPath)}/`,
    plugins,
    htmlData,
    pwa,
  } = (typeof options === 'function' ? await options() : options) || {};

  return defineConfig(async ({ command, mode }) => ({
    base,
    plugins: [
      yaml() as Plugin,
      markdownPlugin({ mode: [Mode.HTML, Mode.TOC] }),
      tree(),
      createHtmlPlugin({
        minify: {
          html5: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          decodeEntities: true,
          minifyCSS: true,
          minifyJS: true,
          minifyURLs: true,
          removeAttributeQuotes: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          sortAttributes: true,
          sortClassName: true,
          useShortDoctype: true,
        },
        inject: {
          data: {
            base,
            command,
            mode,
            ...(await htmlData),
          },
        },
        template: 'src/index.html',
      }),
      // Workaround Vite quotes escaping issue
      {
        name: 'vite-plugin-fix-inline-background-image-urls',
        enforce: 'post',
        transformIndexHtml: {
          enforce: 'post',
          transform: html =>
            html.replace(
              /style=\"background-image:url\("([^"]+)"/g,
              'style="background-image:url(&#34;$1&#34;',
            ),
        },
      },
      ...(pwa ? [VitePWA(await getVitePWAOptions(pwa))] : []),
      ...(plugins || []),
    ],
    build: {
      sourcemap: true,
    },
  }));
};

export default createConfig;
