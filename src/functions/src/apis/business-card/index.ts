import { App, initializeApp, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { defineString } from 'firebase-functions/params';
import { stringify } from 'querystring';
import type { Request } from 'firebase-functions/lib/common/providers/https';
import type { Response } from 'express';

// TODO: maybe migrate to `defineSecret`?
const recaptchaSecret = defineString('RECAPTCHA_SECRET');

let app: App;
let firestore: Firestore;

export const handler = async (
  {
    method,
    body: { ['g-recaptcha-response']: response },
    headers: { ['Fastly-Client-IP']: remoteip },
  }: Request,
  res: Response,
): Promise<void> => {
  if (process.env.NODE_ENV === 'development') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', '*');
    res.set('Access-Control-Allow-Headers', '*');
  }

  if (method === 'OPTIONS') {
    res.status(200).send();
    return;
  }

  try {
    const recaptchaRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?${stringify({
        secret: recaptchaSecret.value(),
        response,
        ...(remoteip && { remoteip }),
      })}`,
    );
    const { success } = (await recaptchaRes.json()) as { success: boolean };

    if (!success) {
      res.status(400).json({ error: 'INVALID_RESPONSE' });
      return;
    }

    if (!app) {
      try {
        app = initializeApp();
      } catch {
        app = getApp();
      }
    }

    if (!firestore) {
      firestore = getFirestore(app);
    }

    const doc = await firestore.collection('business-card').doc('data').get();

    res.json(doc.data());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'UNEXPECTED_ERROR' });
    return;
  }
};
