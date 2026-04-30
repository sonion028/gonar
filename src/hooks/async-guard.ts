import { useState, useRef, useCallback } from 'react';
import { useLatestCallback } from './state';

/**
 * @author sonion
 * @description 异步操作锁，防止重复调用。通过返回的 Promise 确定是否执行中，执行中不可重复触发。
 * @param {(...args: T)=>Promise<R>} asyncAction - 异步方法，需返回Promise
 * @param {(isPending: boolean) => void} [onChange] - 状态变化回调
 * @param {string} [msg] - 警告信息
 * @returns {[boolean, (...args: T) => (Promise<R> | Promise<void>)]} - 返回是否执行中，执行方法
 */
export const useAsyncActionLock = <T extends unknown[], R>(
  asyncAction: (...args: T) => Promise<R>,
  onChange?: (isPending: boolean) => void,
  msg?: string
) => {
  const [isPending, setIsPending] = useState(false); // 对外可能需要触发渲染
  const syncPending = useRef(isPending); // 对内，同步更改，返回的函数不更改
  const latestOnChange = useLatestCallback(onChange); // 稳定函数引用
  const setPending = useCallback(
    (val: boolean) => {
      syncPending.current = val;
      setIsPending(val);
      latestOnChange?.(val);
    },
    [setIsPending, latestOnChange]
  );

  const latestAsyncAction = useLatestCallback(asyncAction); // 稳定函数引用

  const handler = useCallback<(...args: T) => Promise<R> | Promise<void>>(
    (...args: T) => {
      if (syncPending.current) {
        console.clog(msg || '正在提交中，请稍后再试');
        return Promise.resolve(void 0);
      }
      setPending(true);
      return new Promise<R>((resolve, reject) => {
        try {
          resolve(latestAsyncAction?.(...args));
        } catch (err) {
          reject(err);
        }
      }).finally(() => {
        setPending(false);
      });
    },
    [latestAsyncAction, msg, setPending]
  );

  return [isPending, handler] as const;
};
