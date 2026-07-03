import { afterEach, describe, expect, it, vi } from 'vitest';

import { stringToHash } from '../../src/common/crypto/hash';
import { clog } from '../../src/common/debug/dev';

describe('stringToHash', () => {
  it('generates known SHA hashes', async () => {
    await expect(stringToHash('abc', 'SHA-1')).resolves.toBe(
      'a9993e364706816aba3e25717850c26c9cd0d89d'
    );
    await expect(stringToHash('abc', 'SHA-256')).resolves.toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });

  it('rejects empty messages', async () => {
    await expect(stringToHash('')).rejects.toThrow('message is empty');
  });
});

describe('clog', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes styled console output for string messages', () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

    clog('hello', { value: 1 });

    expect(consoleLog).toHaveBeenCalledWith(
      '%c hello',
      expect.stringContaining('background'),
      { value: 1 }
    );
  });
});
