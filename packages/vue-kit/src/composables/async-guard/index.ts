import { shallowRef } from 'vue';

/**
 * @author sonion
 * @description 异步操作锁，防止重复调用。通过返回的 Promise 确定是否执行中，执行中不可重复触发。
 * @param {(...args: T)=>Promise<R>} asyncAction - 异步方法，需返回Promise
 * @param {(isPending: boolean, ...args: T) => void} [onPendingChange] - 状态变化回调
 * @param {string} [msg] - 警告信息
 * @returns {[boolean, (...args: T) => Promise<R | void>]} - 返回是否执行中，执行方法
 */
export const useAsyncActionLock = <T extends unknown[], R>(
  asyncAction: (...args: T) => Promise<R>,
  onPendingChange?: (isPending: boolean, ...args: T) => void,
  msg?: string
) => {
  const isPending = shallowRef(false); // 对外可能需要触发渲染

  const handler = (...args: T) => {
    if (isPending.value) {
      console.log(msg || '正在提交中，请稍后再试');
      return Promise.resolve();
    }
    isPending.value = true;
    onPendingChange?.(true, ...args);
    return new Promise<R>((resolve, reject) => {
      try {
        resolve(asyncAction?.(...args));
      } catch (err) {
        reject(err);
      }
    }).finally(() => {
      isPending.value = false;
      onPendingChange?.(false, ...args);
    });
  };

  return [isPending, handler] as const;
};
