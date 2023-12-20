import { setupWorkerClient } from '@easy-worker/core';
import type { UnicodeWorker } from '../../../workers/text/unicode.worker';

export const unicodeWorker = setupWorkerClient<UnicodeWorker>(
  new Worker(
    new URL('../../../workers/text/unicode.worker.ts', import.meta.url),
    {
      type: 'module',
    },
  ),
  ['encodeText', 'encodeBinary', 'decodeText', 'decodeBinary'],
);
