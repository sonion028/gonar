/**
 * @author sonion
 * @description 创建微队列调度器 - 调度器的作用是将本次同步执行中的所有异步任务防到一个Promise中
 * @returns 调度器函数
 */
export const createMicroQueueScheduler = (): ((
  fn: () => void
) => Promise<void>) => {
  let queueCompleted = false; // 是否开始处理了
  let queue: Array<() => void> = []; // 任务队列
  let currentPromise: Promise<void> | null = null; // 这一个队列集合

  const scheduler = (fn: () => void) => {
    let result: Promise<void>;
    if (!currentPromise) {
      currentPromise = Promise.resolve();
      result = currentPromise
        .then(() => {
          let task: (() => void) | undefined;
          while ((task = queue.shift())) task(); // while遍历过程中加入的任务也能被遍历到。就直接清空对列了
        })
        .finally(() => {
          queueCompleted = true; // 处理过程中还能往queue中加入任务，处理完就不能直接加，要重设queue了
          currentPromise = null;
        });
    } else result = currentPromise;

    if (!queueCompleted) {
      queue.push(fn); // 没开始，就加入
    } else {
      queue = [fn]; // 开始后，就新开一个队列，因为异步，不会影响之前
      queueCompleted = false;
    }
    return result;
  };
  return scheduler;
};
