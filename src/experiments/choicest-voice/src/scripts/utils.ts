export const count = (max: number, onCount: (count: number) => void) =>
  new Promise<void>(resolve => {
    let currentCount = max;
    onCount(currentCount);
    const handle = setInterval(() => {
      currentCount--;
      onCount(currentCount);
      if (currentCount === 0) {
        clearInterval(handle);
        resolve();
      }
    }, 1000);
  });

export const mean = (array: Uint8Array): number =>
  array.reduce((a, b) => a + b, 0) / array.length;

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const getRandomFloat = (): number => {
  // If the Crypto module is available, use it to generate a cryptographically secure random number
  if (window.crypto && window.crypto.getRandomValues) {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    return randomBuffer[0] / (0xffffffff + 1);
  }

  // For older browsers, fallback to the standard Math.random()
  return Math.random();
};

export const getRandomInt = (
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
): number => {
  const randomFloat = getRandomFloat();
  return Math.floor(randomFloat * (max - min + 1)) + min;
};

export const getRandomArrayElement = <T = unknown>(array: T[]): T =>
  array[getRandomInt(0, array.length - 1)];

export const shuffle = <T = unknown>(array: T[]): T[] => {
  const newArr = array.slice();
  for (let i = newArr.length - 1; i > 0; i--) {
    const rand = getRandomInt(0, i);
    [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
  }
  return newArr;
};
