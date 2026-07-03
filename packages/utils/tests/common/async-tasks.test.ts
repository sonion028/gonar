import { describe, expect, it, vi } from 'vitest';

import {
  safeAwait,
  promiseTry,
  withResolver,
} from '../../src/common/async/thenable';
import { ConcurrencyController } from '../../src/common/tasks/concurrency';
import { createMicroQueueScheduler } from '../../src/common/tasks/micro-queue-scheduler';
import { retryAsync } from '../../src/common/tasks/retry-async';

describe('async helpers', () => {
  it('safeAwait wraps fulfilled and rejected promises into tuples', async () => {
    await expect(safeAwait(Promise.resolve('ok'))).resolves.toEqual([
      true,
      null,
      'ok',
    ]);

    const [, error, data] = await safeAwait(Promise.reject('boom'));
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe('boom');
    expect(data).toBeNull();
  });

  it('promiseTry resolves promise-like values and converts thrown errors into rejections', async () => {
    await expect(promiseTry(Promise.resolve(1))).resolves.toBe(1);
    await expect(
      promiseTry(() => {
        throw new Error('sync fail');
      })
    ).rejects.toThrow('sync fail');
  });

  it('withResolver exposes external resolve and reject controls', async () => {
    const resolved = withResolver<number>();
    resolved.resolve(42);
    await expect(resolved.promise).resolves.toBe(42);

    const rejected = withResolver<number>();
    rejected.reject(new Error('fail'));
    await expect(rejected.promise).rejects.toThrow('fail');
  });
});

describe('retryAsync', () => {
  it('returns immediately when the first attempt succeeds', async () => {
    const task = vi.fn().mockResolvedValue('ok');

    await expect(retryAsync(task)).resolves.toBe('ok');

    expect(task).toHaveBeenCalledTimes(1);
  });

  it('retries failures with delay until success', async () => {
    vi.useFakeTimers();
    const task = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('first'))
      .mockRejectedValueOnce(new Error('second'))
      .mockResolvedValue('done');
    const delay = vi.fn(() => 10);

    const result = retryAsync(task, 3, delay);
    await vi.advanceTimersByTimeAsync(20);

    await expect(result).resolves.toBe('done');
    expect(task).toHaveBeenCalledTimes(3);
    expect(delay).toHaveBeenNthCalledWith(1, 0, expect.any(Error));
    expect(delay).toHaveBeenNthCalledWith(2, 1, expect.any(Error));
    vi.useRealTimers();
  });

  it('rejects with the last error when retries are exhausted', async () => {
    vi.useFakeTimers();
    const task = vi.fn().mockRejectedValue(new Error('last'));

    const result = retryAsync(task, 1, 5);
    const assertion = expect(result).rejects.toThrow('last');
    await vi.advanceTimersByTimeAsync(5);

    await assertion;
    expect(task).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

describe('ConcurrencyController', () => {
  it('limits maximum concurrent running tasks', async () => {
    vi.useFakeTimers();
    const controller = new ConcurrencyController<number>(2);
    let running = 0;
    let maxRunning = 0;
    const createTask = (value: number) => () =>
      new Promise<number>((resolve) => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        setTimeout(() => {
          running--;
          resolve(value);
        }, 10);
      });

    const results = [1, 2, 3, 4].map((value) =>
      controller.push(createTask(value))
    );

    expect(maxRunning).toBe(2);
    await vi.advanceTimersByTimeAsync(10);
    expect(maxRunning).toBe(2);
    await vi.advanceTimersByTimeAsync(10);

    await expect(Promise.all(results)).resolves.toEqual([1, 2, 3, 4]);
    vi.useRealTimers();
  });

  it('continues queued tasks after a task rejects', async () => {
    const controller = new ConcurrencyController<string>(1);
    const first = controller.push(() => Promise.reject(new Error('fail')));
    const second = controller.push(() => Promise.resolve('next'));

    await expect(first).rejects.toThrow('fail');
    await expect(second).resolves.toBe('next');
  });
});

describe('createMicroQueueScheduler', () => {
  it('runs scheduled tasks in FIFO order within a microtask', async () => {
    const scheduler = createMicroQueueScheduler();
    const calls: number[] = [];

    scheduler(() => calls.push(1));
    scheduler(() => {
      calls.push(2);
      scheduler(() => calls.push(3));
    });

    expect(calls).toEqual([]);
    await Promise.resolve();
    expect(calls).toEqual([1, 2, 3]);
  });
});
