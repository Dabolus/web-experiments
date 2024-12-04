import { basename } from 'path';
import { promises as fs } from 'fs';
import type { RollupLog, LoggingFunction } from 'rollup';
import { defineConfig, UserConfig, Plugin, ConfigEnv } from 'vite';
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
  outDir?: string;
  fileNames?: {
    assets?: string;
    chunks?: string;
    entries?: string;
  };
}

export type DefineConfigOptionsCallback = (
  env: Pick<ConfigEnv, 'command' | 'mode'>,
) => DefineConfigOptions | Promise<DefineConfigOptions>;

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
      cleanupOutdatedCaches: true,
      navigateFallback: 'index.html',
      globPatterns: [
        '**/*.{js,html,woff2,css,svg,png,jpg,jpeg,gif,ico,webp,jxl,mp4,webm,ogg,mp3,opus}',
      ],
    },
  };
};

const createConfig = async (
  options?: DefineConfigOptions | DefineConfigOptionsCallback,
) =>
  defineConfig(async ({ command, mode }) => {
    const projectPath = process.cwd();
    const {
      base = `/${basename(projectPath)}/`,
      plugins,
      htmlData,
      pwa,
      outDir,
      fileNames,
    } = (typeof options === 'function'
      ? await options({ command, mode })
      : options) || {};

    return {
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
          enforce: 'post' as const,
          transformIndexHtml: {
            order: 'post' as const,
            handler: (html: string) =>
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
        // To support top-level await
        target: ['chrome89', 'edge89', 'firefox89', 'safari15', 'es2022'],
        outDir,
        sourcemap: true,
        rollupOptions: {
          // .NET framework should never be bundled
          external: (src: string) => src.endsWith('/_framework/dotnet.js'),
          output: {
            assetFileNames: fileNames?.assets,
            chunkFileNames: fileNames?.chunks,
            entryFileNames: fileNames?.entries,
          },
          onwarn: (warning: RollupLog, warn: LoggingFunction) => {
            if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
              return;
            }
            warn(warning);
          },
        },
      },
    };
  });

export default createConfig;
