import { basename } from 'path';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import yaml from './plugins/yaml';

export interface DefineConfigOptions {
  base?: string;
  htmlData?: Record<string, any> | Promise<Record<string, any>>;
}

export type DefineConfigOptionsCallback = () =>
  | DefineConfigOptions
  | Promise<DefineConfigOptions>;

const createConfig = async (
  options: DefineConfigOptions | DefineConfigOptionsCallback,
) => {
  const projectPath = process.cwd();
  const { base = `/${basename(projectPath)}/`, htmlData } =
    typeof options === 'function' ? await options() : options;

  return defineConfig({
    base,
    plugins: [
      yaml(),
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
    ],
    build: {
      sourcemap: true,
    },
  });
};

export default createConfig;
