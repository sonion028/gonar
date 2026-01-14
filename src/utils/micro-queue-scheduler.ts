/**
 * @author sonion
 * @description 创建微队列调度器 - 将同一个同步执行阶段中的所有任务合并到一个微任务中执行。
 * @returns 调度器函数
 *
 * 使用场景：
 * - 批量合并异步任务，保证它们在同一个微任务中执行
 * - 避免频繁创建多个 Promise 微任务，提高性能
 * @example
 * const scheduler = createMicroTaskScheduler();
 * scheduler(() => console.log("task1"));
 * scheduler(() => console.log("task2"));
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
