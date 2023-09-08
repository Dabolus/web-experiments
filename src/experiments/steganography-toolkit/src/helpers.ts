export const isPrime = (num: number) => {
  if (num === 1) {
    return false;
  }
  if (num === 2 || num === 3) {
    return true;
  } else if (num % 2 === 0 || num % 3 === 0) {
    return false;
  } else {
    let p = 5;
    let w = 2;
    while (p * p <= num) {
      if (num % p === 0) {
        return false;
      }
      p += w;
      w = 6 - w;
    }
    return true;
  }
};

export const nextPrime = (num: number) => {
  if (num < 3) {
    return num + 1;
  }

  for (
    let currN = num % 2 ? num + 2 : num + 1;
    currN < Number.MAX_SAFE_INTEGER;
    currN += 2
  ) {
    if (isPrime(currN)) {
      return currN;
    }
  }

  // Something went wrong
  return -1;
};

export const chunk = <T extends any[] | string>(arr: T, size: number): T[] =>
  Array.from(
    { length: Math.ceil(arr.length / size) },
    (_, i) => arr.slice(i * size, i * size + size) as T,
  );

export const readFile = <T extends 'binary' | 'text' = 'binary'>(
  file: File,
  format?: T,
): Promise<T extends 'text' ? string : Uint8Array> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = reject;
    reader.onerror = reject;
    reader.onload = () =>
      resolve(
        (format === 'text'
          ? reader.result
          : new Uint8Array(reader.result as ArrayBuffer)) as T extends 'text'
          ? string
          : Uint8Array,
      );
    switch (format) {
      case 'text':
        reader.readAsText(file);
        break;
      default:
        reader.readAsArrayBuffer(file);
        break;
    }
  });
