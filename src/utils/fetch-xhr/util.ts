const RegExpForSplitHeaders = /[\r\n]+/;
const RegExpForSplitHeaderLine = /:\s?/;

/**
 * @author sonion
 * @description 获取响应头
 * @param {XMLHttpRequest} xhr XMLHttpRequest对象
 */
export const getResponseHeaders = function (xhr: XMLHttpRequest) {
  const headerStr = xhr.getAllResponseHeaders();
  const arr = headerStr.trim().split(RegExpForSplitHeaders);
  return new Headers(
    arr.map((line) => line.split(RegExpForSplitHeaderLine)) as [
      string,
      string,
    ][]
  );
};

/**
 * @author sonion
 * @description 自定义超时错误类
 */
export class CustomTimeoutError extends DOMException {
  isTimeout = true;
  constructor(msg?: string) {
    super(msg ?? 'signal is aborted without reason', 'AbortError');
  }
}

/**
 * @author sonion
 * @description 处理请求体，将 ReadableStream 类型转换为 arrayBuffer 类型
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
  const arrayBuffer = new Uint8Array(
    chunks.reduce((acc, cur) => acc + cur.length, 0)
  );
  let offset = 0;
  chunks.forEach((chunk) => {
    arrayBuffer.set(chunk, offset);
    offset += chunk.length;
  });
  return arrayBuffer;
};
