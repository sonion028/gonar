import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  useStaticState,
  useLatestCallback,
  useDistinctState,
  useCreateSafeRef,
} from '../../src/hooks/state';

describe('useStaticState', () => {
  it('should return initial value', () => {
    const { result } = renderHook(() => useStaticState(42));
    const [getValue] = result.current;
    expect(getValue()).toBe(42);
  });

  it('should update value without re-render', () => {
    const { result } = renderHook(() => useStaticState(0));
    const [getValue, setValue] = result.current;

    act(() => {
      setValue(100);
    });

    expect(getValue()).toBe(100);
  });

  it('should return undefined for undefined initial value', () => {
    const { result } = renderHook(() => useStaticState<number>(undefined));
    const [getValue] = result.current;
    expect(getValue()).toBeUndefined();
  });

  it('withValue should get value when called without argument', () => {
    const { result } = renderHook(() => useStaticState('hello'));
    const [, , withValue] = result.current;

    expect(withValue()).toBe('hello');
  });

  it('withValue should set value and return it when called with argument', () => {
    const { result } = renderHook(() => useStaticState('hello'));
    const [getValue, , withValue] = result.current;

    act(() => {
      const returned = withValue('world');
      expect(returned).toBe('world');
    });

    expect(getValue()).toBe('world');
  });

  it('should not trigger re-render when value changes', () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount++;
      return useStaticState(0);
    });

    const [getValue, setValue] = result.current;

    act(() => {
      setValue(1);
      setValue(2);
      setValue(3);
    });

    expect(getValue()).toBe(3);
    expect(renderCount).toBe(1);
  });
});

describe('useLatestCallback', () => {
  it('should call the latest callback when invoked', () => {
    const callback1 = vi.fn();
    const { result, rerender } = renderHook(({ cb }) => useLatestCallback(cb), {
      initialProps: { cb: callback1 },
    });

    const stableCallback = result.current;
    stableCallback('arg1', 'arg2');
    expect(callback1).toHaveBeenCalledWith('arg1', 'arg2');

    const callback2 = vi.fn();
    rerender({ cb: callback2 });

    // 返回的函数引用是稳定的，但会调用最新的回调
    result.current('arg3', 'arg4');
    expect(callback2).toHaveBeenCalledWith('arg3', 'arg4');
    expect(callback1).toHaveBeenCalledTimes(1); // 只被调用一次
  });

  it('should return stable callback function across re-renders', () => {
    const callback1 = vi.fn();
    const { result, rerender } = renderHook(({ cb }) => useLatestCallback(cb), {
      initialProps: { cb: callback1 },
    });

    const stableCallback1 = result.current;

    rerender({ cb: vi.fn() });
    const stableCallback2 = result.current;

    // 返回的函数引用应该是稳定的
    expect(stableCallback1).toBe(stableCallback2);
  });

  it('should handle undefined callback', () => {
    const { result } = renderHook(() => useLatestCallback(undefined));
    const stableCallback = result.current;
    // 当传入 undefined 时，返回的函数调用时应该不执行任何操作（不会抛出错误）
    expect(() => stableCallback?.()).not.toThrow();
  });
});

describe('useDistinctState', () => {
  it('should return initial value', () => {
    const { result } = renderHook(() => useDistinctState({ initialValue: 42 }));
    const [value] = result.current;
    expect(value).toBe(42);
  });

  it('should support function as initial value', () => {
    const { result } = renderHook(() =>
      useDistinctState({ initialValue: () => 100 })
    );
    const [value] = result.current;
    expect(value).toBe(100);
  });

  it('should update value when hasDiff returns true', () => {
    const { result } = renderHook(() =>
      useDistinctState({
        initialValue: 0,
        hasDiff: (prev, next) => prev !== next,
      })
    );
    const [, setValue] = result.current;

    act(() => {
      setValue(1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('should not update value when hasDiff returns false', () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount++;
      return useDistinctState({
        initialValue: { count: 0 },
        hasDiff: (prev, next) => prev?.count !== next?.count,
      });
    });

    const [, setValue] = result.current;

    act(() => {
      setValue({ count: 0 });
    });

    expect(renderCount).toBe(1);
  });

  it('should call onChange when value changes', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDistinctState({
        initialValue: 0,
        onChange,
      })
    );
    const [, setValue] = result.current;

    act(() => {
      setValue(1);
    });

    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('should not call onChange when value does not change', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDistinctState({
        initialValue: 0,
        onChange,
        hasDiff: () => false,
      })
    );
    const [, setValue] = result.current;

    act(() => {
      setValue(1);
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should support onlyEvent mode', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDistinctState({
        initialValue: 0,
        onChange,
        onlyEvent: true,
      })
    );
    const [value, setValue] = result.current;

    expect(value).toBeUndefined();

    act(() => {
      setValue(1);
    });

    expect(onChange).toHaveBeenCalledWith(1);
    expect(result.current[0]).toBeUndefined();
  });

  it('should support functional update', () => {
    const { result } = renderHook(() => useDistinctState({ initialValue: 0 }));
    const [, setValue] = result.current;

    act(() => {
      setValue((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('getter should return current value', () => {
    const { result } = renderHook(() => useDistinctState({ initialValue: 0 }));
    const [, setValue, getValue] = result.current;

    act(() => {
      setValue(42);
    });

    expect(getValue()).toBe(42);
  });
});

describe('useCreateSafeRef', () => {
  it('should return undefined initially', () => {
    const { result } = renderHook(() => useCreateSafeRef());
    const [el] = result.current;
    expect(el).toBeUndefined();
  });

  it('should set element when setEl is called with a valid node', () => {
    const { result } = renderHook(() => useCreateSafeRef<HTMLDivElement>());
    const [, setEl] = result.current;

    const div = document.createElement('div');

    act(() => {
      setEl(div);
    });

    expect(result.current[0]).toBe(div);
  });

  it('should not update when hasDiff returns false', () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount++;
      return useCreateSafeRef<HTMLDivElement>(() => false);
    });
    const [, setEl] = result.current;

    const div1 = document.createElement('div');
    const div2 = document.createElement('div');

    act(() => {
      setEl(div1);
    });

    act(() => {
      setEl(div2);
    });

    expect(renderCount).toBe(1);
  });

  it('should update when hasDiff returns true', () => {
    const { result } = renderHook(() =>
      useCreateSafeRef<HTMLDivElement>(
        (oldNode, newNode) => oldNode !== newNode
      )
    );
    const [, setEl] = result.current;

    const div1 = document.createElement('div');
    const div2 = document.createElement('div');

    act(() => {
      setEl(div1);
    });
    expect(result.current[0]).toBe(div1);

    act(() => {
      setEl(div2);
    });
    expect(result.current[0]).toBe(div2);
  });

  it('should not set null node', () => {
    const { result } = renderHook(() => useCreateSafeRef<HTMLDivElement>());
    const [, setEl] = result.current;

    act(() => {
      setEl(null);
    });

    expect(result.current[0]).toBeUndefined();
  });

  it('isReadyRef should be true after element is set', () => {
    const { result } = renderHook(() => useCreateSafeRef<HTMLDivElement>());
    const [, setEl, isReadyRef] = result.current;

    expect(isReadyRef.current).toBe(false);

    const div = document.createElement('div');
    act(() => {
      setEl(div);
    });

    expect(isReadyRef.current).toBe(true);
  });
});
