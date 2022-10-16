const randomId = () => {
  const [uint32] = window.crypto.getRandomValues(new Uint32Array(1));
  return uint32.toString(16);
};

export const setupWorkerClient = <T extends {}>(
  worker: Worker,
  methods: (keyof T)[],
): T => {
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
      handler.reject(new Error(event.data.reason));
    }
  });

  return Object.fromEntries(
    methods.map(method => [
      method,
      (...args: unknown[]) =>
        new Promise((resolve, reject) => {
          const id = randomId();
          const handle = window.setTimeout(() => {
            delete eventsQueueMap[id];
            reject(new Error('Timeout'));
          }, 10000);
          const wrappedResolve: typeof resolve = (...args) => {
            window.clearTimeout(handle);
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
  ) as T;
};

export const setupWorkerServer = <T extends {}>(methods: T) => {
  self.addEventListener('message', async event => {
    const { id, method, args = [] } = event.data;
    if (!id || !Object.keys(methods).includes(method)) {
      return;
    }
    try {
      const result = await (methods[method as keyof T] as Function)(...args);
      self.postMessage({
        id,
        status: 'fulfilled',
        value: result,
      });
    } catch (error) {
      self.postMessage({
        id,
        status: 'rejected',
        reason: (error as Error).message,
      });
    }
  });

  return methods;
};
