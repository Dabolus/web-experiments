import { Plugin } from 'vite';
import { load } from 'js-yaml';
import toSource from 'tosource';

const yaml = (): Plugin => ({
  name: 'yaml',
  transform(src, id) {
    if (id.endsWith('.yml') || id.endsWith('.yaml')) {
      return {
        code: `export default ${toSource(load(src))}\n`,
      };
    }
  },
});

export default yaml;
