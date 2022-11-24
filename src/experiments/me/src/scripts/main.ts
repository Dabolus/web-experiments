import { executeCaptcha, renderCaptcha } from './captcha.js';
import { generateVCard, PrivateData } from './utils.js';

const apiUrl = import.meta.env.VITE_API_URL || '';

const contactsCaptcha = document.querySelector<HTMLDivElement>('#captcha')!;
const phoneNumberListOption = document.querySelector<HTMLLIElement>('#phone')!;
const phoneNumberButton = phoneNumberListOption.querySelector('button')!;
const phoneNumberAnchor = phoneNumberListOption.querySelector('a')!;
const phoneNumberSpan = phoneNumberListOption.querySelector('span')!;
const whatsappListOption = document.querySelector<HTMLLIElement>('#whatsapp')!;
const whatsappButton = whatsappListOption.querySelector('button')!;
const whatsappAnchor = whatsappListOption.querySelector('a')!;
const whatsappSpan = whatsappListOption.querySelector('span')!;
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
  phoneNumberAnchor.href = `tel:${privateData.phoneNumber}`;
  phoneNumberSpan.textContent = privateData.phoneNumber;
  phoneNumberSpan.removeAttribute('aria-hidden');
  phoneNumberListOption.removeAttribute('aria-disabled');
  phoneNumberButton.remove();

  // WhatsApp
  const whatsAppNumber = privateData.phoneNumber.replace(/[^\d]/g, '');
  whatsappAnchor.href = `https://wa.me/${whatsAppNumber}`;
  whatsappSpan.textContent = `wa.me/${whatsAppNumber}`;
  whatsappSpan.removeAttribute('aria-hidden');
  whatsappListOption.removeAttribute('aria-disabled');
  whatsappButton.remove();

  // Add to contacts
  const vCard = generateVCard({ ...privateData, whatsAppNumber });
  addToContacts.href = URL.createObjectURL(
    new Blob([vCard], { type: 'text/vcard' }),
  );
  addToContacts.download = 'gga.vcf';
  addToContacts.onclick = null;
};

phoneNumberButton.onclick = getPrivateData;
whatsappButton.onclick = getPrivateData;
addToContacts.onclick = async () => {
  await getPrivateData();
  addToContacts.click();
};

window.addEventListener('load', () => renderCaptcha(contactsCaptcha), {
  once: true,
});
