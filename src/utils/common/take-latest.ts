export const takeLatest = <
  T extends (signal: AbortSignal, ...args: Parameters<T>) => ReturnType<T>,
>(
  action: T
) => {
  let abortController = new AbortController();
  return (...args: Parameters<T>) => {
    abortController.abort();
    abortController = new AbortController();
    return action(abortController.signal, ...args);
  };
};
