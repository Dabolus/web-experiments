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
