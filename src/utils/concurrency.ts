/**
 * @author sonion
 * @description 并发控制器
 * @param {number} concurrency - 并发数
 */
export class ConcurrencyController<T> {
  /** 任务队列 */
  private queue: Array<{
    task: () => Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
  }> = [];
  /** 并发数 */
  private concurrency: number;
  /** 当前运行中的任务数 */
  private running = 0;

  constructor(concurrency = 5) {
    this.concurrency = concurrency;
  }

  push(task: () => Promise<T>) {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.run();
    });
  }

  run() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      this.next();
    }
  }

  private next() {
    if (this.running >= this.concurrency) return;
    this.running++;
    const { task, resolve, reject } = this.queue.shift() ?? {};
    if (!task) return;
    task()
      .then(resolve, reject)
      .finally(() => {
        this.running--;
        this.run();
      });
  }
}
