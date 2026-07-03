export type RAfIntervalReturn = Record<'stop', () => void>;

/**
 * @author sonion
 * @description rAf版setInterval。可利用rAf页面隐藏暂停的特性，实现页面隐藏时暂停，页面显示时继续
 * @param {() => void} frame - 回调函数
 * @param {number} duration - 间隔时间 毫秒
 * @returns {RAfIntervalReturn} - 返回取消函数
 */
export const rAfInterval = (
  frame: () => void,
  duration: number
): RAfIntervalReturn => {
  let startTime = Date.now();
  let isStop = false;
  const stop = () => (isStop = true);
  const _interval = () => {
    requestAnimationFrame(() => {
      if (isStop) return;
      const currentTime = Date.now();
      if (currentTime - startTime >= duration) {
        frame();
        startTime = currentTime;
      }
      isStop || _interval();
    });
  };
  requestAnimationFrame(_interval);
  return { stop };
};

/**
 * @author sonion
 * @description 清除rAf版setInterval定时器
 * @param {RAfIntervalReturn} intervalId - 手写定时器的返回值
 * @returns {void}
 */
export const clearRAfInterval = (
  intervalId: RAfIntervalReturn | (() => void) | undefined
) => {
  typeof intervalId === 'object' && intervalId.stop?.();
  typeof intervalId === 'function' && intervalId();
};
