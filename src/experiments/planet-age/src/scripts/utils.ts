export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
) => {
  let timeout: number;

  return function (this: T, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};
