import { useCallback } from 'react';
import { setupWorkerClient } from '@easy-worker/core';
import type { PreprocessorWorker } from '../workers/preprocessor.worker';

const preprocessorWorker = new Worker(
  new URL('../workers/preprocessor.worker.ts', import.meta.url),
  {
    type: 'module',
  },
);

const preprocessorWorkerClient =
  setupWorkerClient<PreprocessorWorker>(preprocessorWorker);

export interface UsePreprocessorValue {
  encrypt: PreprocessorWorker['encrypt'];
  decrypt: PreprocessorWorker['decrypt'];
}

export type UsePreprocessorHook = () => UsePreprocessorValue;

const usePreprocessor: UsePreprocessorHook = () => {
  const encrypt = useCallback<UsePreprocessorValue['encrypt']>(
    async (...args) => preprocessorWorkerClient.encrypt(...args),
    [],
  );

  const decrypt = useCallback<UsePreprocessorValue['decrypt']>(
    async (...args) => preprocessorWorkerClient.decrypt(...args),
    [],
  );

  return { encrypt, decrypt };
};

export default usePreprocessor;
