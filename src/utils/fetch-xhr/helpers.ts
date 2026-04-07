/**
 * @author sonion
 * @description
 * @param xhr - XMLHttpRequest 实例对象
 * @param headers 请求头参数
 */
export const setRequestHeaders = (
  xhr: XMLHttpRequest,
  headers: RequestInit['headers']
) => {
  if (!headers) {
    return
  }
  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      xhr.setRequestHeader(key, value);
    });
    return;
  }
  const entries = Array.isArray(headers) ? headers : Object.entries(headers);
  entries.forEach(([key, value]) => {
    xhr.setRequestHeader(key, value);
  });
};

/**
 * @author sonion
 * @description 处理请求体，将 ReadableStream 类型转换为 Blob 类型
 * @param body - 请求体
 * @param signal - 信号量
 */
export const handleRequestBody = async (
  body: RequestInit['body'],
  signal?: AbortSignal | null
) => {
  if (!(body instanceof ReadableStream)) {
    return body;
  }
  const chunks: Uint8Array[] = [];
  const reader = body.getReader();
  while (true) {
    signal?.throwIfAborted(); // 信号被终止，就抛出错误
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return new Blob(chunks as BlobPart[]);
};

/** 响应头分隔符 正则 */
const RegExpForSplitHeaders = /[\r\n]+/;

/**
 * @author sonion
 * @description 获取响应头
 * @param {XMLHttpRequest} xhr XMLHttpRequest对象
 */
export const getResponseHeaders = function (xhr: XMLHttpRequest) {
  const headerStr = xhr.getAllResponseHeaders();
  const arr = headerStr.trim().split(RegExpForSplitHeaders);
  const headerLines = arr.map((line) => {
    const index = line.indexOf(':');
    if (index <= -1) {
      return [] as unknown as [string, string];
    }
    return [line.slice(0, index), line.slice(index + 1).trim()] satisfies [
      string,
      string,
    ];
  });
  return new Headers(headerLines);
};

/**
 * @author sonion
 * @description 自定义超时错误类
 */
export class CustomTimeoutError extends DOMException {
  readonly isTimeout = true;
  constructor(msg?: string) {
    super(msg ?? 'signal is aborted without reason', 'AbortError');
  }
}
