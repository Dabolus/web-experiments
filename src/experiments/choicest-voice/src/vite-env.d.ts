/// <reference types="vite/client" />

declare module '@virtual:tree:*' {
  import type { DirStructureElement } from '../../../config/vite/plugins/tree';
  const tree: DirStructureElement[];
  export default tree;
}

declare module '*.md' {
  export interface TOCItem {
    level: string;
    content: string;
  }

  export const toc: TOCItem[];
  export const html: string;
}
