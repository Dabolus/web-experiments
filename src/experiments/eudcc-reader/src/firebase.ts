import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent as firebaseLogEvent } from 'firebase/analytics';

// Initialize Firebase
export const app = initializeApp({
  apiKey: 'AIzaSyBYfHqdu4EwWQNws_xF2wMpR_ExbpuP-98',
  authDomain: 'giorgio-garasto-projects.firebaseapp.com',
  databaseURL: 'https://giorgio-garasto-projects.firebaseio.com',
  projectId: 'giorgio-garasto-projects',
  storageBucket: 'giorgio-garasto-projects.appspot.com',
  messagingSenderId: '90082720114',
  appId: '1:90082720114:web:ce7169b24d5996b37dc5eb',
  measurementId: 'G-2K71JVEWWT',
});

export const analytics = getAnalytics(app);

export const logEvent = async (
  eventName: Parameters<typeof firebaseLogEvent>[1],
  eventParams?: Parameters<typeof firebaseLogEvent>[2],
  options?: Parameters<typeof firebaseLogEvent>[3],
) => {
  if (process.env.NODE_ENV !== 'production') {
    console.groupCollapsed('Analytics event');
    console.info(`Name: ${eventName}`);

    if (eventParams && Object.keys(eventParams).length > 0) {
      console.info('Params:');
      console.table(eventParams);
    }

    console.groupEnd();

    return;
  }

  return firebaseLogEvent(
    analytics,
    eventName,
    {
      ...eventParams,
      experiment: 'eudcc-reader',
      offline: false,
    },
    options,
  );
};
