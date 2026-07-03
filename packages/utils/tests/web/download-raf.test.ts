import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { blobDownload, browserNativeDownload } from '../../src/web/download';
import { clearRAfInterval, rAfInterval } from '../../src/web/raf-interval';

describe('download helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('browserNativeDownload resolves when a tab is opened and focuses old tab', async () => {
    const focus = vi.spyOn(window, 'focus').mockImplementation(() => {});
    vi.spyOn(window, 'open').mockReturnValue({ closed: false } as Window);

    await expect(browserNativeDownload('/file')).resolves.toBe(true);

    expect(window.open).toHaveBeenCalledWith(
      '/file',
      '_blank',
      'noopener,noreferrer'
    );
    expect(focus).toHaveBeenCalled();
  });

  it('browserNativeDownload rejects when a tab is blocked', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null);

    await expect(browserNativeDownload('/file')).rejects.toThrow(/拦截/);
  });

  it('blobDownload clicks an anchor and always revokes object url', () => {
    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:test');
    const revokeObjectURL = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {});
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    blobDownload(new Blob(['hello']), 'hello.txt', false);

    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });
});

describe('rAfInterval', () => {
  let callbacks: FrameRequestCallback[];
  let now: number;

  beforeEach(() => {
    callbacks = [];
    now = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      callbacks.push(cb);
      return callbacks.length;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const flushNextFrame = () => {
    const cb = callbacks.shift();
    cb?.(now);
  };

  it('runs callback only after wait has elapsed and can be cleared', () => {
    const fn = vi.fn();
    const timer = rAfInterval(fn, 100);

    flushNextFrame();
    now = 99;
    flushNextFrame();
    expect(fn).not.toHaveBeenCalled();

    now = 100;
    flushNextFrame();
    expect(fn).toHaveBeenCalledTimes(1);

    clearRAfInterval(timer);
  });

  it('[defect-probing] does not run an already queued frame after stop', () => {
    const fn = vi.fn();
    const timer = rAfInterval(fn, 100);

    flushNextFrame();
    now = 100;
    clearRAfInterval(timer);
    flushNextFrame();

    expect(fn).not.toHaveBeenCalled();
  });

  it('accepts a stop function in clearRAfInterval', () => {
    const stop = vi.fn();
    clearRAfInterval(stop);
    clearRAfInterval(undefined);
    expect(stop).toHaveBeenCalledTimes(1);
  });
});
