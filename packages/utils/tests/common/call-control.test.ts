import { describe, expect, it, vi } from 'vitest';

import { debounce } from '../../src/common/call-control/debounce';
import { takeLatest } from '../../src/common/call-control/take-latest';

describe('debounce', () => {
  it('runs only the latest call after delay and preserves args/this', () => {
    vi.useFakeTimers();
    const context = { prefix: 'ctx' };
    const fn = vi.fn(function (this: typeof context, value: string) {
      return `${this.prefix}:${value}`;
    });
    const debounced = debounce(fn, 100);

    debounced.call(context, 'first');
    debounced.call(context, 'second');
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('second');
    vi.useRealTimers();
  });
});

describe('takeLatest', () => {
  it('aborts the previous signal before invoking the latest action', () => {
    const seenSignals: AbortSignal[] = [];
    const action = vi.fn((signal: AbortSignal, value: string) => {
      seenSignals.push(signal);
      return value;
    });
    const latest = takeLatest(action as never) as unknown as (
      value: string
    ) => string;

    expect(latest('first')).toBe('first');
    const firstSignal = seenSignals[0] as AbortSignal;
    expect(firstSignal.aborted).toBe(false);

    expect(latest('second')).toBe('second');
    const secondSignal = seenSignals[1] as AbortSignal;

    expect(firstSignal.aborted).toBe(true);
    expect(secondSignal.aborted).toBe(false);
    expect(action).toHaveBeenCalledTimes(2);
  });
});
