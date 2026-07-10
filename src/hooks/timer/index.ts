import { useCallback } from 'react';
import { type RAfIntervalReturn, rAfInterval, clearRAfInterval } from '@/utils';
import { useLatestCallback, useStaticState } from '../state';

/**
 * @author sonion
 * @description 自管理定时器的interval
 * @param {()=>void} cb - 回调函数
 * @param {number} duration - 时间间隔
 * @returns {[() => void, () => void]} - [启动函数, 清除函数]
 */
export const useInterval = (cb: () => void, duration: number) => {
  const [, , withTimer] = useStaticState<ReturnType<typeof setTimeout>>(void 0);

  const latestCallback = useLatestCallback(cb);
  const run = useCallback(() => {
    clearTimeout(withTimer());
    withTimer(
      setTimeout(() => {
        try {
          latestCallback?.();
        } catch (err) {
          console.error('useInterval error', err);
        }
        run?.();
      }, duration)
    );
  }, [duration, latestCallback, withTimer]);
  const stop = useCallback(() => clearTimeout(withTimer()), [withTimer]);
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
  const [, , withTimer] = useStaticState<RAfIntervalReturn>(void 0);
  const run = useCallback(() => {
    clearRAfInterval(withTimer());
    withTimer(rAfInterval(cb, duration));
  }, [cb, duration, withTimer]);
  const stop = useCallback(() => clearRAfInterval(withTimer()), [withTimer]);
  return [run, stop] as const;
};
