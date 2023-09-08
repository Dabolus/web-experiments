import { useCallback } from 'react';
import { setupWorkerClient } from '../workers/utils';
import type { PreprocessorWorker } from '../workers/preprocessor.worker';

const preprocessorWorker = setupWorkerClient<PreprocessorWorker>(
  new Worker(new URL('../workers/preprocessor.worker.ts', import.meta.url), {
    type: 'module',
  }),
  ['encrypt', 'decrypt'],
);

export interface UsePreprocessorValue {
  encrypt: PreprocessorWorker['encrypt'];
  decrypt: PreprocessorWorker['decrypt'];
}

export type UsePreprocessorHook = () => UsePreprocessorValue;

const usePreprocessor: UsePreprocessorHook = () => {
  const encrypt = useCallback<UsePreprocessorValue['encrypt']>(
    async (...args) => preprocessorWorker.encrypt(...args),
    [],
  );

  const decrypt = useCallback<UsePreprocessorValue['decrypt']>(
    async (...args) => preprocessorWorker.decrypt(...args),
    [],
  );

  return { encrypt, decrypt };
};

export default usePreprocessor;
