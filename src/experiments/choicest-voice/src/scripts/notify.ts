const notification = document.querySelector<HTMLElement>('#notification')!;
const notificationContent = notification.firstElementChild! as HTMLDivElement;

notification.addEventListener('transitionend', () => {
  if (!notification.classList.contains('shown')) {
    notification.hidden = true;
    notificationContent.textContent = '';
  }
});

let previousHandle: number;

export const notify = (text: string, time = 3000) => {
  notificationContent.textContent = text;
  notification.style.fontSize = text.length > 20 ? '3rem' : '6rem';
  notification.hidden = false;
  setTimeout(() => notification.classList.add('shown'), 50);
  if (previousHandle) {
    window.clearTimeout(previousHandle);
  }
  if (time >= 300) {
    previousHandle = window.setTimeout(() => {
      notification.classList.remove('shown');
    }, time - 300);
  }
};
