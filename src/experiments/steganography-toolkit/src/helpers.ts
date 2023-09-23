export type PickMatching<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

export type ExcludeMatching<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K];
};

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

export type ReadFileFormat = 'binary' | 'dataURL' | 'text';

const formatToMethodMap: Record<
  ReadFileFormat,
  keyof PickMatching<FileReader, (file: File) => any>
> = {
  binary: 'readAsArrayBuffer',
  dataURL: 'readAsDataURL',
  text: 'readAsText',
};

export const readFile = <T extends ReadFileFormat = 'binary'>(
  file: File,
  format: T = 'binary' as T,
): Promise<T extends 'dataURL' | 'text' ? string : Uint8Array> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = reject;
    reader.onerror = reject;
    reader.onload = () =>
      resolve(
        (format === 'dataURL' || format === 'text'
          ? reader.result
          : new Uint8Array(reader.result as ArrayBuffer)) as T extends
          | 'dataURL'
          | 'text'
          ? string
          : Uint8Array,
      );
    reader[formatToMethodMap[format]](new Blob([file]));
  });

export const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export const getImageData = async (
  src: string | HTMLImageElement,
): Promise<ImageData> => {
  const img = typeof src === 'string' ? await loadImage(src) : src;
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
};
