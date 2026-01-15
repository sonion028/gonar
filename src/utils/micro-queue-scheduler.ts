/**
 * @author sonion
 * @description 创建微队列调度器 - 将同一个同步执行阶段中的所有任务合并到一个微任务中执行。
 * @returns 调度器函数
 *
 * 使用场景：
 * - 批量合并异步任务，保证它们在同一个微任务中执行
 * - 避免频繁创建多个 Promise 微任务，提高性能
 * @example
 * const scheduler = createMicroQueueScheduler();
 * scheduler(() => console.log("task1"));
 * scheduler(() => console.log("task2"));
 */
export const createMicroQueueScheduler = (): ((
  fn: () => void
) => Promise<void>) => {
  const queue: Array<() => void> = []; // 任务队列
  let currentPromise: Promise<void> | null = null; // 这一个队列集合

  const scheduler = (fn: () => void) => {
    queue.push(fn);

    if (!currentPromise) {
      currentPromise = Promise.resolve()
        .then(() => {
          let task: (() => void) | undefined;
          while ((task = queue.shift())) task(); // while遍历过程中加入的任务也能被遍历到。就直接清空对列了
        })
        .finally(() => {
          currentPromise = null;
          // queue.length = 0; // 冗余，queue.shift() 会清空队列
        });
    }

    return currentPromise;
  };
  return scheduler;
};
