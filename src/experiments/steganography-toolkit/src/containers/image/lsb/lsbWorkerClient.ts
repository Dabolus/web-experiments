import { setupWorkerClient } from '@easy-worker/core';
import type { LSBWorker } from '../../../workers/image/lsb.worker';

export const lsbWorker = new Worker(
  new URL('../../../workers/image/lsb.worker.ts', import.meta.url),
  { type: 'module' },
);

export const lsbWorkerClient = setupWorkerClient<LSBWorker>(lsbWorker);
