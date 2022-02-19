import { join } from 'path';
import { promises as fs } from 'fs';
import { load } from 'js-yaml';

export const fromYaml = async <T = unknown>(path: string) => {
  const absolutePath = join(process.cwd(), path);
  const rawContent = await fs.readFile(absolutePath, 'utf8');
  return load(rawContent) as T;
};
