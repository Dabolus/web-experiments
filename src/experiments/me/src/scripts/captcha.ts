import { importIIFE } from './utils.js';

declare global {
  interface Window {
    __captchaLoadedCallback: () => void;
  }
}

let captchaPromise: Promise<unknown>;

export const importCaptcha = () => {
  if (!captchaPromise) {
    captchaPromise = new Promise<void>((resolve, reject) => {
      window.__captchaLoadedCallback = resolve;
      importIIFE(
        'https://www.google.com/recaptcha/enterprise.js?onload=__captchaLoadedCallback&render=explicit',
      ).catch(reject);
    });
  }

  return captchaPromise;
};

const captchaCache = new Map<
  HTMLElement,
  Promise<{ readonly id: number; readonly response: Promise<string> }>
>();

export const renderCaptcha = (element: HTMLElement) => {
  if (!captchaCache.has(element)) {
    captchaCache.set(
      element,
      importCaptcha().then(() => {
        let result: string;
        let error: Error;

        const response = new Promise<string>((resolve, reject) => {
          const loop = () => {
            if (result) {
              return resolve(result);
            }
            if (error) {
              return reject(error);
            }

            requestAnimationFrame(loop);
          };

          loop();
        });

        const id = grecaptcha.enterprise.render(element, {
          sitekey: '6Ld-UiojAAAAADqkvOWENWL_2hiNg2f8q6ei3ReC',
          theme: 'dark',
          size: 'invisible',
          callback: res => {
            result = res;
          },
          'error-callback': () => {
            error = new Error();
          },
        });

        return {
          id,
          response,
        };
      }),
    );
  }

  return captchaCache.get(element);
};

export const executeCaptcha = async (element: HTMLElement) => {
  const { id, response } = await captchaCache.get(element)!;

  grecaptcha.enterprise.execute(id);

  return response;
};

export const resetCaptcha = async (element: HTMLElement) => {
  const { id } = await captchaCache.get(element)!;

  grecaptcha.enterprise.reset(id);
};
