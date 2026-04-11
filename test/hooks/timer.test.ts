import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInterval, useRAfInterval } from '../../src/hooks/timer';

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return run and stop functions', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useInterval(callback, 1000));

    const [run, stop] = result.current;
    expect(typeof run).toBe('function');
    expect(typeof stop).toBe('function');
  });

  it('should call callback after duration when run is called', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useInterval(callback, 1000));
    const [run] = result.current;

    act(() => {
      run();
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should call callback repeatedly', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useInterval(callback, 1000));
    const [run] = result.current;

    act(() => {
      run();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('should stop calling callback when stop is called', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useInterval(callback, 1000));
    const [run, stop] = result.current;

    act(() => {
      run();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      stop();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should restart when run is called again after stop', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useInterval(callback, 1000));
    const [run, stop] = result.current;

    act(() => {
      run();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      stop();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      run();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should use latest callback reference', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const { result, rerender } = renderHook(
      ({ cb, duration }) => useInterval(cb, duration),
      { initialProps: { cb: callback1, duration: 1000 } }
    );

    const [run] = result.current;

    act(() => {
      run();
    });

    rerender({ cb: callback2, duration: 1000 });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should clear previous timer when run is called multiple times', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useInterval(callback, 1000));
    const [run] = result.current;

    act(() => {
      run();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      run();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('useRAfInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return run and stop functions', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useRAfInterval(callback, 1000));

    const [run, stop] = result.current;
    expect(typeof run).toBe('function');
    expect(typeof stop).toBe('function');
  });

  it('should call callback via requestAnimationFrame', async () => {
    const callback = vi.fn();
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');

    const { result } = renderHook(() => useRAfInterval(callback, 1000));
    const [run] = result.current;

    act(() => {
      run();
    });

    expect(rafSpy).toHaveBeenCalled();

    rafSpy.mockRestore();
  });

  it('should stop when stop is called', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useRAfInterval(callback, 1000));
    const [run, stop] = result.current;

    act(() => {
      run();
    });

    act(() => {
      stop();
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should restart when run is called after stop', () => {
    const callback = vi.fn();
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');

    const { result } = renderHook(() => useRAfInterval(callback, 1000));
    const [run, stop] = result.current;

    act(() => {
      run();
    });

    act(() => {
      stop();
    });

    const initialCallCount = rafSpy.mock.calls.length;

    act(() => {
      run();
    });

    expect(rafSpy.mock.calls.length).toBeGreaterThan(initialCallCount);

    rafSpy.mockRestore();
  });
});
