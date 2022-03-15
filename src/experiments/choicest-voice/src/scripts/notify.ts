const notification = document.querySelector<HTMLElement>('#notification')!;

notification.addEventListener('transitionend', () => {
  if (!notification.classList.contains('shown')) {
    notification.hidden = true;
    notification.textContent = '';
  }
});

let previousHandle: number;

export const notify = (text: string, time = 3000) => {
  notification.textContent = text;
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
