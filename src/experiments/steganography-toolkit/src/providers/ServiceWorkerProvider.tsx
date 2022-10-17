import React, {
  FunctionComponent,
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  PropsWithChildren,
} from 'react';

import { registerSW } from 'virtual:pwa-register';

export interface ServiceWorkerContextValue {
  updateReady: boolean;
  offlineReady: boolean;
  update(this: void): void;
}

export const ServiceWorkerContext = createContext<
  ServiceWorkerContextValue | undefined
>(undefined);

export const ServiceWorkerProvider: FunctionComponent<
  PropsWithChildren<{}>
> = props => {
  const [updateReady, setUpdateReady] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  const updateSW = useMemo(
    () =>
      registerSW({
        onRegistered: registration => {
          if (registration) {
            // Periodically check for updates when the app is left open
            setInterval(
              () => void registration.update(),
              300000 /* 5 minutes */,
            );
          }
        },
        onNeedRefresh: () => setUpdateReady(true),
        onOfflineReady: () => setOfflineReady(true),
      }),
    [],
  );

  const update = useCallback(
    () =>
      Promise.race([
        // Sometimes service worker update gets stuck and doesn't automatically refresh the browser
        // so we manually refresh the browser after 5 seconds to avoid this situation
        new Promise<void>(resolve =>
          setTimeout(() => {
            window.location.reload();
            resolve();
          }, 5000),
        ),
        updateSW(),
      ]),
    [updateSW],
  );

  return (
    <ServiceWorkerContext.Provider
      value={{ updateReady, offlineReady, update }}
      {...props}
    />
  );
};

export const useServiceWorker = (): ServiceWorkerContextValue => {
  const context = useContext(ServiceWorkerContext);

  if (!context) {
    throw new Error(
      'useServiceWorker must be used within a ServiceWorkerProvider',
    );
  }

  return context;
};

export default ServiceWorkerProvider;
