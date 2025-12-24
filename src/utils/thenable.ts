type SafeAwaitResult<T> = [true, null, T] | [false, Error, null];

/**
 * @author sonion
 * @description 安全的 await 函数。
 * @param {Promise<T>} promise 要执行的 Promise 函数
 * @returns {Promise<SafeAwaitResult<T>>} - 返回一个元组，第一个元素为是否成功，第二个元素为错误信息，第三个元素为数据
 */
export const safeAwait = async <T>(
  promise: Promise<T>
): Promise<SafeAwaitResult<T>> => {
  try {
    const data = await Promise.resolve(promise);
    return [true, null, data] as const;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return [false, error, null] as const;
  }
};
