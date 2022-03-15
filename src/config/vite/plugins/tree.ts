import path from 'path';
import { promises as fs } from 'fs';
import { Plugin } from 'vite';
import toSource from 'tosource';

export interface DirStructureElement {
  name: string;
  children?: DirStructureElement[];
}

const recursiveReadDir = async (
  dir: string,
): Promise<DirStructureElement[] | undefined> => {
  const dirStat = await fs.stat(dir);
  if (!dirStat.isDirectory()) {
    return;
  }
  const dirContent = await fs.readdir(dir);
  return Promise.all(
    dirContent.map(async name => {
      const children = await recursiveReadDir(`${dir}/${name}`);
      return {
        name,
        ...(children && { children }),
      };
    }),
  );
};

const virtualModulePrefix = '@virtual:tree:';

const tree = (): Plugin => ({
  name: 'vite-plugin-tree',
  enforce: 'pre',
  resolveId(id, importer = '.') {
    if (id.startsWith(virtualModulePrefix)) {
      const relativePath = id.slice(virtualModulePrefix.length);
      const absolutePath = path.resolve(importer, '..', relativePath);
      return `${virtualModulePrefix}${absolutePath}`;
    }
  },
  async load(id) {
    if (id.startsWith(virtualModulePrefix)) {
      const absolutePath = id.slice(virtualModulePrefix.length);
      const content = await recursiveReadDir(absolutePath);
      return `export default ${toSource(content)}\n`;
    }
  },
});

export default tree;
