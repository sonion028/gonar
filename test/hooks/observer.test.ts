import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  useMutationObserver,
  useIntersectionObserver,
  useResizeObserver,
} from '../../src/hooks/observer';

describe('useMutationObserver', () => {
  let mockObserver: {
    observe: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    takeRecords: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockObserver = {
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn().mockReturnValue([]),
    };

    class MockMutationObserver {
      observe = mockObserver.observe;
      disconnect = mockObserver.disconnect;
      takeRecords = mockObserver.takeRecords;
    }

    globalThis.MutationObserver =
      MockMutationObserver as unknown as typeof MutationObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return observe, takeRecords, and disconnect functions', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useMutationObserver(callback));

    expect(typeof result.current.observe).toBe('function');
    expect(typeof result.current.takeRecords).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
  });

  it('should create MutationObserver when observe is called', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useMutationObserver(callback));

    act(() => {
      result.current.observe(document.body);
    });

    expect(mockObserver.observe).toHaveBeenCalledWith(document.body, undefined);
  });

  it('should pass options to observe', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useMutationObserver(callback));
    const options = { childList: true, subtree: true };

    act(() => {
      result.current.observe(document.body, options);
    });

    expect(mockObserver.observe).toHaveBeenCalledWith(document.body, options);
  });

  it('should not observe when element is null', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useMutationObserver(callback));

    act(() => {
      result.current.observe(null);
    });

    expect(mockObserver.observe).not.toHaveBeenCalled();
  });

  it('should call takeRecords', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useMutationObserver(callback));

    act(() => {
      result.current.observe(document.body);
    });

    const records = result.current.takeRecords();

    expect(mockObserver.takeRecords).toHaveBeenCalled();
    expect(records).toEqual([]);
  });

  it('should call disconnect', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useMutationObserver(callback));

    act(() => {
      result.current.observe(document.body);
    });

    result.current.disconnect();

    expect(mockObserver.disconnect).toHaveBeenCalled();
  });
});

describe('useIntersectionObserver', () => {
  let mockObserver: {
    observe: ReturnType<typeof vi.fn>;
    unobserve: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };

    class MockIntersectionObserver {
      observe = mockObserver.observe;
      unobserve = mockObserver.unobserve;
      disconnect = mockObserver.disconnect;
    }

    globalThis.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return observe, unobserve, and disconnect functions', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useIntersectionObserver({ callback }));

    expect(typeof result.current.observe).toBe('function');
    expect(typeof result.current.unobserve).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
  });

  it('should create IntersectionObserver when observe is called', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useIntersectionObserver({ callback }));

    const element = document.createElement('div');

    act(() => {
      result.current.observe(element);
    });

    expect(mockObserver.observe).toHaveBeenCalledWith(element);
  });

  it('should not observe when element is null', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useIntersectionObserver({ callback }));

    act(() => {
      result.current.observe(null);
    });

    expect(mockObserver.observe).not.toHaveBeenCalled();
  });

  it('should unobserve element', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useIntersectionObserver({ callback }));

    const element = document.createElement('div');

    act(() => {
      result.current.observe(element);
      result.current.unobserve(element);
    });

    expect(mockObserver.unobserve).toHaveBeenCalledWith(element);
  });

  it('should disconnect on unmount', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() =>
      useIntersectionObserver({ callback })
    );

    const element = document.createElement('div');

    act(() => {
      result.current.observe(element);
    });

    unmount();

    expect(mockObserver.disconnect).toHaveBeenCalled();
  });
});

describe('useResizeObserver', () => {
  let mockObserver: {
    observe: ReturnType<typeof vi.fn>;
    unobserve: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };

    class MockResizeObserver {
      observe = mockObserver.observe;
      unobserve = mockObserver.unobserve;
      disconnect = mockObserver.disconnect;
    }

    globalThis.ResizeObserver =
      MockResizeObserver as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return observe, unobserve, and disconnect functions', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useResizeObserver(callback));

    expect(typeof result.current.observe).toBe('function');
    expect(typeof result.current.unobserve).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
  });

  it('should create ResizeObserver when observe is called', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useResizeObserver(callback));

    const element = document.createElement('div');

    act(() => {
      result.current.observe(element);
    });

    expect(mockObserver.observe).toHaveBeenCalledWith(element, undefined);
  });

  it('should pass options to observe', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useResizeObserver(callback));
    const options = { box: 'border-box' as const };

    const element = document.createElement('div');

    act(() => {
      result.current.observe(element, options);
    });

    expect(mockObserver.observe).toHaveBeenCalledWith(element, options);
  });

  it('should not observe when element is null', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useResizeObserver(callback));

    act(() => {
      result.current.observe(null);
    });

    expect(mockObserver.observe).not.toHaveBeenCalled();
  });

  it('should unobserve element', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useResizeObserver(callback));

    const element = document.createElement('div');

    act(() => {
      result.current.observe(element);
    });

    result.current.unobserve(element);

    expect(mockObserver.unobserve).toHaveBeenCalledWith(element);
  });

  it('should disconnect on unmount', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useResizeObserver(callback));

    const element = document.createElement('div');

    act(() => {
      result.current.observe(element);
    });

    unmount();

    expect(mockObserver.disconnect).toHaveBeenCalled();
  });

  it('should unobserve before re-observing same element', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useResizeObserver(callback));

    const element = document.createElement('div');

    act(() => {
      result.current.observe(element);
    });

    mockObserver.observe.mockClear();
    mockObserver.unobserve.mockClear();

    act(() => {
      result.current.observe(element);
    });

    expect(mockObserver.unobserve).toHaveBeenCalledWith(element);
    expect(mockObserver.observe).toHaveBeenCalledWith(element, undefined);
  });
});
