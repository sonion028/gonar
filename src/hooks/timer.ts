import { useRef, useCallback } from 'react';
import { type RAfIntervalReturn, rAfInterval, clearRAfInterval } from '@/utils';
import { useLatestCallback } from './state';

/**
 * @author sonion
 * @description 自管理定时器的interval
 * @param {()=>void} cb - 回调函数
 * @param {number} duration - 时间间隔
 * @returns {[() => void, () => void]} - [启动函数, 清除函数]
 */
export const useInterval = (cb: () => void, duration: number) => {
  const timer = useRef<ReturnType<typeof setTimeout>>(void 0);
  const latestCallback = useLatestCallback(cb);
  const run = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        latestCallback?.();
      } catch (err) {
        console.error('useInterval error', err);
      }
      run?.();
    }, duration);
  }, [duration, latestCallback]);
  const stop = useCallback(() => clearTimeout(timer.current), [timer]);
  return [run, stop] as const;
};

/**
 * @author sonion
 * @description 自管理定时器的rAfInterval
 * @param {()=>void} cb - 回调函数
 * @param {number} duration - 时间间隔
 * @returns {[() => void, () => void]} - [启动函数, 清除函数]
 */
export const useRAfInterval = (cb: () => void, duration: number) => {
  const timer = useRef<RAfIntervalReturn>(void 0);
  const run = useCallback(() => {
    clearRAfInterval(timer.current);
    timer.current = rAfInterval(cb, duration);
  }, [cb, duration]);
  const stop = useCallback(() => clearRAfInterval(timer.current), [timer]);
  return [run, stop] as const;
};
