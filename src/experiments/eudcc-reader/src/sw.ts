/* eslint-disable no-restricted-globals */

import { setCacheNameDetails, clientsClaim } from 'workbox-core';
import {
  precacheAndRoute,
  createHandlerBoundToURL,
  cleanupOutdatedCaches,
} from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import * as googleAnalytics from 'workbox-google-analytics';
import type { PrecacheEntry } from 'workbox-precaching/_types';

type ClientType = 'window' | 'worker' | 'sharedworker' | 'all';

declare global {
  interface Window {
    __WB_MANIFEST: PrecacheEntry[];
    clients: {
      claim(): Promise<void>;
      get(id: string): Promise<WindowClient>;
      matchAll<T extends ClientType = ClientType>(options?: {
        includeUncontrolled?: boolean;
        type?: T;
      }): Promise<Array<T extends 'window' ? WindowClient : Client>>;
      openWindow(url: string): Promise<WindowClient>;
    };
    registration: ServiceWorkerRegistration;
  }
  interface WindowEventMap {
    push: PushEvent;
    notificationclick: NotificationEvent;
    fetch: FetchEvent;
  }
  function skipWaiting(): void;
}

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

clientsClaim();

if (process.env.NODE_ENV === 'development') {
  console.groupCollapsed('Workbox precache manifest');
  self.__WB_MANIFEST.forEach(entry => console.info(entry));
  console.groupEnd();
} else {
  setCacheNameDetails({
    prefix: 'steganography-toolkit',
  });
  precacheAndRoute(self.__WB_MANIFEST);
  cleanupOutdatedCaches();
  registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));
}

googleAnalytics.initialize({
  hitFilter: params => params.set('ep.offline', 'true'),
});
