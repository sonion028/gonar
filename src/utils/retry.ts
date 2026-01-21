/**
 * @author sonion
 * @description 重试任务，直到成功或达到最大重试次数
 * @param task - 要重试的任务函数，需返回 Promise
 * @param count - 最大重试次数，默认 5 次
 * @param delay - 每次重试间隔时间，默认 0 毫秒，可传入函数，根据重试次数动态计算。
 * @returns Promise<R> - 任务成功时的返回值
 */
export const retry = <R>(
  task: () => Promise<R>,
  count = 5,
  delay: number | ((nextCount: number) => number) = 0
) => {
  return new Promise<R>((resolve, reject) => {
    const attempt = async (remainingCount: number) => {
      task()
        .then(resolve)
        .catch((error) => {
          if (remainingCount > 0) {
            const nextCount = remainingCount - 1;
            setTimeout(
              () => attempt(nextCount),
              typeof delay === 'function' ? delay(nextCount) : delay
            );
          } else {
            reject(error);
          }
        });
    };
    attempt(count);
  });
};
