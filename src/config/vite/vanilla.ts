import { basename } from 'path';
import { defineConfig, UserConfig, Plugin } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import yaml from '@rollup/plugin-yaml';

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
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            base,
            ...(await htmlData),
          },
        },
        template: 'src/index.html',
      }),
      ...(plugins || []),
    ],
    build: {
      sourcemap: true,
    },
  });
};

export default createConfig;
