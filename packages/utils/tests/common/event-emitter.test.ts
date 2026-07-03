import { describe, expect, it, vi } from 'vitest';

import { EventEmitter } from '../../src/common/event-emitter';

type Events = {
  change: { value: number };
  optional: undefined;
  text: string;
};

describe('EventEmitter', () => {
  it('emits events asynchronously with the default scheduler', async () => {
    const emitter = new EventEmitter<Events>();
    const handler = vi.fn();

    emitter.on('change', handler);
    emitter.emit('change', { value: 1 });

    expect(handler).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(handler).toHaveBeenCalledWith({ value: 1 });
  });

  it('supports synchronous custom scheduler, off aliases and clear by event name', () => {
    const emitter = new EventEmitter<Events>((handler) => handler());
    const change = vi.fn();
    const text = vi.fn();

    emitter.on('change', change);
    emitter.on('text', text);
    emitter.emit('change', { value: 2 });
    emitter.off('change', change);
    emitter.emit('change', { value: 3 });
    emitter.clear('text');
    emitter.emit('text', 'hello');

    expect(change).toHaveBeenCalledTimes(1);
    expect(text).not.toHaveBeenCalled();
  });

  it('supports once and AbortSignal options', async () => {
    const emitter = new EventEmitter<Events>();
    const once = vi.fn();
    const withSignal = vi.fn();
    const controller = new AbortController();

    emitter.on('optional', once, { once: true });
    emitter.on('optional', withSignal, { signal: controller.signal });
    emitter.emit('optional');
    await Promise.resolve();
    controller.abort();
    emitter.emit('optional');
    await Promise.resolve();

    expect(once).toHaveBeenCalledTimes(1);
    expect(withSignal).toHaveBeenCalledTimes(1);
  });

  it('validates event listener options', () => {
    const emitter = new EventEmitter<Events>();

    expect(() => emitter.on('text', vi.fn(), [] as never)).toThrow(/配置对象/);
    expect(() =>
      emitter.on('text', vi.fn(), { unknown: true } as never)
    ).toThrow(/仅支持/);
  });
});
