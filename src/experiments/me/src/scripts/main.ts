import { executeCaptcha, renderCaptcha } from './captcha.js';
import { generateVCard, PrivateData } from './utils.js';

const apiUrl = import.meta.env.VITE_API_URL || '';

const contactsCaptcha = document.querySelector<HTMLDivElement>('#captcha')!;
const phoneNumberListOption = document.querySelector<HTMLLIElement>('#phone')!;
const phoneNumberButton = phoneNumberListOption.querySelector('button')!;
const addToContacts =
  document.querySelector<HTMLAnchorElement>('#add-to-contacts')!;

const getPrivateData = async () => {
  const recaptchaResponse = await executeCaptcha(contactsCaptcha);
  const res = await fetch(`${apiUrl}/api/business-card/data`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      'g-recaptcha-response': recaptchaResponse,
    }),
  });
  const privateData = (await res.json()) as PrivateData;

  // Phone number
  phoneNumberListOption.querySelector(
    'a',
  )!.href = `tel:${privateData.phoneNumber}`;
  phoneNumberListOption.querySelector('span')!.textContent =
    privateData.phoneNumber;
  phoneNumberListOption.removeAttribute('aria-disabled');
  phoneNumberButton.remove();

  // Add to contacts
  const vCard = generateVCard(privateData);
  addToContacts.href = URL.createObjectURL(
    new Blob([vCard], { type: 'text/vcard' }),
  );
  addToContacts.download = 'gga.vcf';
  addToContacts.onclick = null;
};

phoneNumberButton.onclick = getPrivateData;
addToContacts.onclick = async () => {
  await getPrivateData();
  addToContacts.click();
};

window.addEventListener('load', () => renderCaptcha(contactsCaptcha), {
  once: true,
});
