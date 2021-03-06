import { basename } from 'path';
import { defineConfig, UserConfig, Plugin } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { plugin as markdownPlugin, Mode } from 'vite-plugin-markdown';
import yaml from '@rollup/plugin-yaml';
import tree from './plugins/tree';

export interface DefineConfigOptions {
  base?: UserConfig['base'];
  plugins?: UserConfig['plugins'];
  htmlData?: Record<string, any> | Promise<Record<string, any>>;
}

export type DefineConfigOptionsCallback = () =>
  | DefineConfigOptions
  | Promise<DefineConfigOptions>;

const createConfig = async (
  options?: DefineConfigOptions | DefineConfigOptionsCallback,
) => {
  const projectPath = process.cwd();
  const {
    base = `/${basename(projectPath)}/`,
    plugins,
    htmlData,
  } = (typeof options === 'function' ? await options() : options) || {};

  return defineConfig({
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
      ...(plugins || []),
    ],
    build: {
      sourcemap: true,
    },
  });
};

export default createConfig;
