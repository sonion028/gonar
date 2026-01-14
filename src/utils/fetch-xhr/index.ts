import {
  setRequestHeaders,
  handleRequestBody,
  getResponseHeaders,
  CustomTimeoutError,
} from './helpers';

export { CustomTimeoutError };

// fetch 请求参数中 xhr 支持的参数
type RequestInitFields =
  | 'body'
  | 'method'
  | 'headers'
  | 'credentials'
  | 'signal';

export interface FetchXHRInit extends Pick<RequestInit, RequestInitFields> {
  /**
   * @description 超时时间，单位毫秒
   */
  timeout?: number;
  /**
   * @description 上传进度回调
   */
  onUploadProgress?: (loaded: number, total: number, e: ProgressEvent) => void;
  /**
   * @description 下载进度回调
   */
  onDownloadProgress?: (
    loaded: number,
    total: number,
    e: ProgressEvent
  ) => void;
}

/**
 * @author sonion
 * @description 基于 XMLHttpRequest 实现的 fetch 函数。
 * 除增加 timeout、onUploadProgress、onDownloadProgress 外，其他与 fetch 一致。
 * @param url 请求地址
 * @param init 请求配置。
 */
export const fetchXHR = async (url: string, init?: FetchXHRInit) => {
  return new Promise<Response>((resolve, reject) => {
    const {
      body,
      method = 'GET',
      headers,
      credentials,
      signal,
      timeout,
      onUploadProgress,
      onDownloadProgress,
    } = init || {};
    const xhr = new XMLHttpRequest();
    const normalizedMethod = method.toUpperCase();
    xhr.open(normalizedMethod, url, true); // 必须在设置请求头之前
    // 设置请求头
    setRequestHeaders(xhr, headers);
    credentials === 'include' && (xhr.withCredentials = true); // cookie跨域是否携带
    xhr.responseType = 'blob'; // 固定 blob，传给Response处理
    typeof timeout === 'number' &&
      !Number.isNaN(timeout) &&
      (xhr.timeout = timeout); // 设置超时时间

    onUploadProgress &&
      (xhr.upload.onprogress = (e) => onUploadProgress(e.loaded, e.total, e));

    onDownloadProgress &&
      (xhr.onprogress = (e) => onDownloadProgress(e.loaded, e.total, e));

    if (signal) {
      const handleAbort = () => xhr.abort();
      signal.addEventListener('abort', handleAbort, { once: true });
      xhr.onloadend = () => signal?.removeEventListener('abort', handleAbort);
    }

    xhr.onabort = () =>
      reject(
        new DOMException('signal is aborted without reason', 'AbortError')
      );

    // 兼容 fetch 的超时写法。继承 DOMException name 也是 AbortError。扩展 isTimeout 标识是否超时。
    xhr.ontimeout = () => reject(new CustomTimeoutError('请求超时'));

    xhr.onerror = () => reject(new TypeError('网络错误'));

    // 200系、400系、500系状态码都认为是成功
    xhr.onload = () =>
      resolve(
        new Response(xhr.response, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: getResponseHeaders(xhr),
        })
      );

    handleRequestBody(body, signal).then((res) =>
      xhr.send(['GET', 'HEAD'].includes(normalizedMethod) ? null : res)
    ); // 处理请求体,在发送
  });
};
