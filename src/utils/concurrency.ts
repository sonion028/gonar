/**
 * @author sonion
 * @description 并发控制器
 * @param {number} concurrency - 并发数
 */
export class ConcurrencyController<T> {
  private queue: (() => Promise<T>)[] = [];
  private concurrency: number;
  private running = 0;

  constructor(concurrency = 5) {
    this.concurrency = concurrency;
  }

  push(task: () => Promise<T>) {
    return new Promise<T>((resolve, reject) => {
      const wrapper = () => {
        try {
          const res = task();
          res.then(resolve, reject);
          return res;
        } catch (err) {
          reject(err);
          throw err; // 保证返回 Promise
        }
      };
      this.queue.push(wrapper);
      this.run();
    });
  }

  run() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      this.next();
    }
  }

  private next() {
    if (this.running >= this.concurrency) {
      return;
    }
    this.running++;
    const task = this.queue.shift();
    if (task) {
      task().finally(() => {
        this.running--;
        this.run();
      });
    }
  }
}
