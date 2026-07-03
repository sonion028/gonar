import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchXHR } from '../../src/web/fetch-xhr';
import {
  CustomTimeoutError,
  getResponseHeaders,
  handleRequestBody,
  setRequestHeaders,
} from '../../src/web/fetch-xhr/helpers';

class MockXHR {
  static instances: MockXHR[] = [];

  method = '';
  url = '';
  async = false;
  requestHeaders: Record<string, string> = {};
  responseType = '';
  timeout = 0;
  withCredentials = false;
  status = 200;
  statusText = 'OK';
  response = new Blob(['ok']);
  sentBody: XMLHttpRequestBodyInit | null | undefined;
  aborted = false;
  upload: { onprogress: ((e: ProgressEvent) => void) | null } = {
    onprogress: null,
  };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  onloadend: (() => void) | null = null;
  onprogress: ((e: ProgressEvent) => void) | null = null;

  constructor() {
    MockXHR.instances.push(this);
  }

  open(method: string, url: string, async: boolean) {
    this.method = method;
    this.url = url;
    this.async = async;
  }

  setRequestHeader(key: string, value: string) {
    this.requestHeaders[key] = value;
  }

  send(body?: XMLHttpRequestBodyInit | null) {
    this.sentBody = body;
  }

  abort() {
    this.aborted = true;
    this.onabort?.();
    this.onloadend?.();
  }

  getAllResponseHeaders() {
    return 'content-type: text/plain\r\nx-id: 1';
  }
}

describe('fetch-xhr helpers', () => {
  it('sets headers from Headers, entries and plain objects', () => {
    const xhr = new MockXHR() as unknown as XMLHttpRequest;

    setRequestHeaders(xhr, new Headers({ a: '1' }));
    setRequestHeaders(xhr, [['b', '2']]);
    setRequestHeaders(xhr, { c: '3' });

    expect((xhr as unknown as MockXHR).requestHeaders).toEqual({
      a: '1',
      b: '2',
      c: '3',
    });
  });

  it('handles non-stream and ReadableStream request bodies', async () => {
    await expect(handleRequestBody('body')).resolves.toBe('body');

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2]));
        controller.close();
      },
    });

    const body = await handleRequestBody(stream);
    expect(body).toBeInstanceOf(Blob);
    await expect((body as Blob).arrayBuffer()).resolves.toEqual(
      new Uint8Array([1, 2]).buffer
    );
  });

  it('parses response headers and marks timeout errors', () => {
    const headers = getResponseHeaders(
      new MockXHR() as unknown as XMLHttpRequest
    );
    const timeoutError = new CustomTimeoutError('timeout');

    expect(headers.get('content-type')).toBe('text/plain');
    expect(headers.get('x-id')).toBe('1');
    expect(timeoutError.name).toBe('AbortError');
    expect(timeoutError.isTimeout).toBe(true);
  });
});

describe('fetchXHR', () => {
  const OriginalXHR = window.XMLHttpRequest;

  beforeEach(() => {
    MockXHR.instances = [];
    vi.stubGlobal('XMLHttpRequest', MockXHR);
  });

  const getXhr = (index = 0) => {
    const xhr = MockXHR.instances[index];
    if (!xhr) {
      throw new Error(`MockXHR instance ${index} was not created`);
    }
    return xhr;
  };

  afterEach(() => {
    vi.unstubAllGlobals();
    window.XMLHttpRequest = OriginalXHR;
  });

  it('opens requests, sets options and resolves with a Response on load', async () => {
    const promise = fetchXHR('/api', {
      method: 'POST',
      body: 'hello',
      headers: { 'x-token': 'token' },
      credentials: 'include',
      timeout: 100,
    });
    const xhr = getXhr();

    expect(xhr.method).toBe('POST');
    expect(xhr.url).toBe('/api');
    expect(xhr.async).toBe(true);
    expect(xhr.requestHeaders['x-token']).toBe('token');
    expect(xhr.withCredentials).toBe(true);
    expect(xhr.timeout).toBe(100);
    await Promise.resolve();
    expect(xhr.sentBody).toBe('hello');

    xhr.onload?.();
    const response = await promise;

    expect(response.status).toBe(200);
    expect(response.headers.get('x-id')).toBe('1');
  });

  it('sends null body for GET and HEAD requests', async () => {
    fetchXHR('/api', { method: 'GET', body: 'ignored' });
    await Promise.resolve();
    expect(getXhr(0).sentBody).toBeNull();

    fetchXHR('/api', { method: 'HEAD', body: 'ignored' });
    await Promise.resolve();
    expect(getXhr(1).sentBody).toBeNull();
  });

  it('rejects on network error, abort and timeout', async () => {
    const network = fetchXHR('/network');
    getXhr(0).onerror?.();
    await expect(network).rejects.toThrow('网络错误');

    const aborted = fetchXHR('/abort');
    getXhr(1).onabort?.();
    await expect(aborted).rejects.toMatchObject({ name: 'AbortError' });

    const timeout = fetchXHR('/timeout');
    getXhr(2).ontimeout?.();
    await expect(timeout).rejects.toMatchObject({
      name: 'AbortError',
      isTimeout: true,
    });
  });

  it('forwards upload and download progress events', () => {
    const onUploadProgress = vi.fn();
    const onDownloadProgress = vi.fn();

    fetchXHR('/progress', { onUploadProgress, onDownloadProgress });
    const xhr = getXhr();
    const event = new ProgressEvent('progress', { loaded: 1, total: 2 });

    xhr.upload.onprogress?.(event);
    xhr.onprogress?.(event);

    expect(onUploadProgress).toHaveBeenCalledWith(1, 2, event);
    expect(onDownloadProgress).toHaveBeenCalledWith(1, 2, event);
  });

  it('[defect-probing] rejects an already aborted signal without sending XHR', async () => {
    const controller = new AbortController();
    controller.abort();

    const promise = fetchXHR('/aborted', { signal: controller.signal });
    await Promise.resolve();

    expect(MockXHR.instances).toHaveLength(0);
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });
});
