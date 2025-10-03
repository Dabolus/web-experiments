import { setupWorkerClient } from '@easy-worker/core';
import type { PVDWorker } from '../../../workers/image/pvd.worker';

export const pvdWorker = new Worker(
  new URL('../../../workers/image/pvd.worker.ts', import.meta.url),
  { type: 'module' },
);

export const pvdWorkerClient = setupWorkerClient<PVDWorker>(pvdWorker);
