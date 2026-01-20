import { useState, useRef, useCallback } from 'react';
import { useLatestCallback } from './state';

/**
 * @author sonion
 * @description 异步操作锁，防止重复调用。通过返回的 Promise 确定是否执行中，执行中不可重复触发。
 * @template {unknown[]} T - 异步方法的参数类型数组
 * @template R - 异步方法返回的 Promise 的泛型
 * @param {(...args: T)=>Promise<R>} asyncAction - 异步方法，需返回Promise
 * @param {(isPending: boolean) => void} [onChange] - 状态变化回调
 * @param {string} [msg] - 警告信息
 * @returns {[boolean, (...args: T) => Promise<R> | Promise<void>]} - 返回是否执行中，执行方法
 */
export const useAsyncActionLock = <T extends unknown[], R>(
  asyncAction: (...args: T) => Promise<R>,
  onChange?: (isPending: boolean) => void,
  msg?: string
) => {
  const [isPending, setIsPending] = useState(false); // 对外可能需要触发渲染
  const syncPending = useRef(isPending); // 对内，同步更改，返回的函数不更改
  const getLatestOnChange = useLatestCallback(onChange); // 稳定函数引用
  const setPending = useCallback(
    (val: boolean) => {
      syncPending.current = val;
      setIsPending(val);
      getLatestOnChange()?.(val);
    },
    [syncPending, setIsPending, getLatestOnChange]
  );

  const getLatestAsyncAction = useLatestCallback(asyncAction); // 稳定函数引用

  const handler = useCallback<(...args: T) => Promise<R> | Promise<void>>(
    (...args: T) => {
      if (syncPending.current) {
        console.clog(msg || '正在提交中，请稍后再试');
        return Promise.resolve(void 0);
      }
      setPending(true);
      return new Promise<R>((resolve, reject) => {
        try {
          const latestAsyncAction = getLatestAsyncAction();
          resolve(latestAsyncAction?.(...args));
        } catch (err) {
          reject(err);
        }
      }).finally(() => {
        setPending(false);
      });
    },
    [getLatestAsyncAction, msg, setPending]
  );

  return [isPending, handler] as const;
};
