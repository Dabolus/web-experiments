import { setupWorkerClient } from '@easy-worker/core';
import type { LSBWorker } from '../../../workers/image/lsb.worker';

export const lsbWorker = setupWorkerClient<LSBWorker>(
  new Worker(new URL('../../../workers/image/lsb.worker.ts', import.meta.url), {
    type: 'module',
  }),
  ['encode', 'decode'],
);
