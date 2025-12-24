import { useRef, useCallback } from 'react';
import { type RAfIntervalReturn, rAfInterval, clearRAfInterval } from '@/utils';

/**
 * @author sonion
 * @description 自管理定时器的interval
 * @param {()=>void} cb - 回调函数
 * @param {number} duration - 时间间隔
 * @returns {[() => void, () => void]} - [启动函数, 清除函数]
 */
export const useInterval = (cb: () => void, duration: number) => {
  const timer = useRef<ReturnType<typeof setTimeout>>(void 0);
  const cbRef = useRef(cb);
  cbRef.current = cb;
  const run = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      cbRef.current();
      // eslint-disable-next-line react-hooks/immutability
      run?.();
    }, duration);
  }, [duration]);
  const stop = useCallback(() => clearTimeout(timer.current), [timer]);
  return [run, stop];
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
