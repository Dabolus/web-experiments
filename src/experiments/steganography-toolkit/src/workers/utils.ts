export type PromisifiedObject<T extends {}> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<Awaited<R>>
    : T[K];
};

export type PromisifiedWorker<T extends Worker> = Worker &
  PromisifiedObject<Omit<T, keyof Worker>>;

export const setupWorkerClient = <T extends Worker, U = Omit<T, keyof Worker>>(
  worker: Worker,
  methods: (keyof U)[],
  timeout = 30000,
): PromisifiedWorker<T> => {
  const eventsQueueMap: Record<
    string,
    { resolve: Function; reject: Function }
  > = {};

  worker.addEventListener('message', event => {
    const handler = eventsQueueMap[event.data.id];
    if (!handler) {
      return;
    }
    if (event.data.status === 'fulfilled') {
      handler.resolve(event.data.value);
    } else {
      handler.reject(
        Object.assign(new Error(event.data.reason.name), event.data.reason),
      );
    }
  });

  return Object.assign(
    worker,
    Object.fromEntries(
      methods.map(method => [
        method,
        (...args: unknown[]) =>
          new Promise((resolve, reject) => {
            const id = crypto.randomUUID();
            const handle = setTimeout(() => {
              delete eventsQueueMap[id];
              reject(new Error('Timeout'));
            }, timeout);
            const wrappedResolve: typeof resolve = (...args) => {
              clearTimeout(handle);
              return resolve(...args);
            };
            eventsQueueMap[id] = { resolve: wrappedResolve, reject };
            worker.postMessage({
              id,
              method,
              args,
            });
          }),
      ]),
    ),
  ) as PromisifiedWorker<T>;
};

export const setupWorkerServer = <T extends Worker, U = Omit<T, keyof Worker>>(
  methods: U,
) => {
  self.addEventListener('message', async event => {
    const { id, method, args = [] } = event.data;
    if (!id || !Object.keys(methods as {}).includes(method)) {
      return;
    }
    try {
      const result = await (methods[method as keyof U] as Function)(...args);
      self.postMessage({
        id,
        status: 'fulfilled',
        value: result,
      });
    } catch (error) {
      self.postMessage({
        id,
        status: 'rejected',
        reason:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
                cause: error.cause,
              }
            : {
                name: 'UnknownError',
                message: 'Unknown error',
              },
      });
    }
  });

  return methods;
};
