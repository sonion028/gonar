/**
 * @author sonion
 * @description 重试任务，直到成功或达到最大重试次数
 * @param task - 要重试的任务函数，需返回 Promise
 * @param count - 最大重试次数，默认 5 次
 * @param delay - 每次重试间隔时间，默认 0 毫秒。可传函数，根据重试次数、错误信息动态计算。
 * @returns Promise<R> - 任务成功时的返回值
 */
export const retryAsync = <R>(
  task: () => Promise<R>,
  count = 5,
  delay: number | ((attemptIndex?: number, beforeError?: Error) => number) = 0
) => {
  return new Promise<R>((resolve, reject) => {
    const attempt = (remainingCount: number) => {
      task()
        .then(resolve)
        .catch((error) => {
          if (remainingCount <= 0) {
            return reject(error);
          }
          const attemptIndex = count - remainingCount; // 第几次重试
          const wait =
            typeof delay === 'function' ? delay(attemptIndex, error) : delay;
          setTimeout(() => attempt(remainingCount - 1), wait);
        });
    };
    attempt(count);
  });
};
