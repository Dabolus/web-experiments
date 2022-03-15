/// <reference types="vite/client" />

declare module '@virtual:tree:*' {
  import type { DirStructureElement } from '../../../config/vite/plugins/tree';
  const tree: DirStructureElement[];
  export default tree;
}
