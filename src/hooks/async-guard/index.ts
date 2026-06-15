import { useState, useRef, useCallback } from 'react';
import { useLatestCallback } from '../state';

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
  const [isPending, setIsPending] = useState(false); // 对外可能需要触发渲染
  const syncPending = useRef(isPending); // 对内，同步更改，返回的函数不更改
  const latestOnPendingChange = useLatestCallback(onPendingChange); // 稳定函数引用
  const setPending = useCallback(
    (val: boolean, ...args: T) => {
      syncPending.current = val;
      setIsPending(val);
      latestOnPendingChange?.(val, ...args);
    },
    [latestOnPendingChange]
  );

  const latestAsyncAction = useLatestCallback(asyncAction); // 稳定函数引用

  const handler = useCallback<(...args: T) => Promise<R | void>>(
    (...args: T) => {
      if (syncPending.current) {
        console.log(msg || '正在提交中，请稍后再试');
        return Promise.resolve();
      }
      setPending(true, ...args);
      return new Promise<R>((resolve, reject) => {
        try {
          resolve(latestAsyncAction?.(...args));
        } catch (err) {
          reject(err);
        }
      }).finally(() => {
        setPending(false, ...args);
      });
    },
    [latestAsyncAction, msg, setPending]
  );

  return [isPending, handler] as const;
};
