import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAsyncActionLock } from '../../src/hooks/async-guard';

describe('useAsyncActionLock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should return isPending as false initially', () => {
    const asyncAction = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsyncActionLock(asyncAction));

    const [isPending] = result.current;
    expect(isPending).toBe(false);
  });

  it('should return handler function', () => {
    const asyncAction = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsyncActionLock(asyncAction));

    const [, handler] = result.current;
    expect(typeof handler).toBe('function');
  });

  it('should call asyncAction when handler is called', async () => {
    const asyncAction = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsyncActionLock(asyncAction));
    const [, handler] = result.current;

    await act(async () => {
      handler();
    });

    expect(asyncAction).toHaveBeenCalledTimes(1);
  });

  it('should set isPending to true while asyncAction is pending', async () => {
    let resolvePromise: (value: string) => void;
    const asyncAction = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() => useAsyncActionLock(asyncAction));
    const [, handler] = result.current;

    act(() => {
      handler();
    });

    expect(result.current[0]).toBe(true);

    await act(async () => {
      resolvePromise!('done');
    });

    expect(result.current[0]).toBe(false);
  });

  it('should prevent duplicate calls while pending', async () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    let resolvePromise: (value: string) => void;
    const asyncAction = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() => useAsyncActionLock(asyncAction));
    const [, handler] = result.current;

    act(() => {
      handler();
      handler();
      handler();
    });

    expect(asyncAction).toHaveBeenCalledTimes(1);
    expect(consoleLog).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolvePromise!('done');
    });

    expect(result.current[0]).toBe(false);
  });

  it('should allow new call after previous call completes', async () => {
    const asyncAction = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsyncActionLock(asyncAction));
    const [, handler] = result.current;

    await act(async () => {
      await handler();
    });

    expect(asyncAction).toHaveBeenCalledTimes(1);

    await act(async () => {
      await handler();
    });

    expect(asyncAction).toHaveBeenCalledTimes(2);
  });

  it('should call onChange when pending state changes', async () => {
    let resolvePromise: (value: string) => void;
    const asyncAction = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolvePromise = resolve;
        })
    );
    const onChange = vi.fn();

    const { result } = renderHook(() =>
      useAsyncActionLock(asyncAction, onChange)
    );
    const [, handler] = result.current;

    act(() => {
      handler();
    });

    expect(onChange).toHaveBeenCalledWith(true);

    await act(async () => {
      resolvePromise!('done');
    });

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('should return result from asyncAction', async () => {
    const asyncAction = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(() =>
      useAsyncActionLock<[], string>(asyncAction)
    );
    const [, handler] = result.current;

    let returnedValue: string | void = undefined;
    await act(async () => {
      returnedValue = await handler();
    });

    expect(returnedValue).toBe('success');
  });

  it('should pass arguments to asyncAction', async () => {
    const asyncAction = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsyncActionLock(asyncAction));
    const [, handler] = result.current;

    await act(async () => {
      await handler('arg1', 'arg2');
    });

    expect(asyncAction).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should handle asyncAction rejection', async () => {
    const error = new Error('test error');
    const asyncAction = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useAsyncActionLock(asyncAction));
    const [, handler] = result.current;

    await act(async () => {
      try {
        await handler();
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    expect(result.current[0]).toBe(false);
  });

  it('should use latest asyncAction reference', async () => {
    const asyncAction1 = vi.fn().mockResolvedValue('result1');
    const asyncAction2 = vi.fn().mockResolvedValue('result2');

    const { result, rerender } = renderHook(
      ({ action }) => useAsyncActionLock(action),
      { initialProps: { action: asyncAction1 } }
    );

    rerender({ action: asyncAction2 });

    const [, handler] = result.current;

    await act(async () => {
      await handler();
    });

    expect(asyncAction1).not.toHaveBeenCalled();
    expect(asyncAction2).toHaveBeenCalledTimes(1);
  });

  it('should log warning message when called while pending', async () => {
    let resolvePromise: (value: string) => void;
    const asyncAction = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() =>
      useAsyncActionLock(asyncAction, undefined, 'custom warning message')
    );
    const [, handler] = result.current;

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    act(() => {
      handler();
      handler();
    });

    expect(logSpy).toHaveBeenCalledWith('custom warning message');

    await act(async () => {
      resolvePromise!('done');
    });
  });
});
