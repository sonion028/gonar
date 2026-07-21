import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useCreateSafeRef, useLatestCallback, useStaticState } from '../state';

type MutationObserverCallback = (
  entry: MutationRecord[],
  observer: MutationObserver
) => void;
/**
 * @author sonion
 * @description dom变化观察器hook
 * @param {MutationObserverCallback} callback - 回调函数，参数为 MutationRecord[]
 * @param {boolean} [once] - 是否只观察一次，默认false
 */
export const useMutationObserver = (
  callback: MutationObserverCallback,
  once = false
) => {
  const observerRef = useRef<MutationObserver>();
  const latestCallback = useLatestCallback(callback);

  useEffect(
    () => () => {
      observerRef.current?.disconnect?.(); // 上一次观察器取消，observe没有重新运行的话，观察就丢失了
      observerRef.current = void 0;
    },
    []
  );

  // MutationObserver 重新生成对象，observe 不会更新，用 observe 做依赖可能造成
  // MutationObserver 更新了，但没有重新观察。但理论上只有 StrictMode 模式下会重新生成对象
  // 且observe不是作为依赖，而是直接绑定dom或依赖其它重渲染会改变的状态就不会有问题。
  // 或用Set存下历史观察，重生成时恢复，但不能用WeakSet，非必要不建议
  /** 开始观察 因重新生成观察器observe不会更新，故不可以observe是否更新做依赖依据 */
  const observe = useCallback(
    (el: Node | null, options?: MutationObserverInit) => {
      if (!el) return;
      observerRef.current ??= new MutationObserver(
        (mutations: MutationRecord[], observer: MutationObserver) => {
          latestCallback?.(mutations, observer);
          once && observer.disconnect();
        }
      );
      observerRef.current?.observe?.(el, options);
    },
    // oxlint-disable-next-line react/react-compiler
    [once, latestCallback]
  );

  const takeRecords = useCallback(
    () => observerRef.current?.takeRecords?.(),
    []
  );

  const disconnect = useCallback(() => observerRef.current?.disconnect?.(), []);

  return {
    /** 开始观察 因重新生成观察器observe不会更新，故不可以observe是否更新做依赖依据 */
    observe,
    /** 获取所有未处理的观察记录 */
    takeRecords,
    /** 取消所有观察，用observe重新启用 */
    disconnect,
  };
};

type IntersectionObserverCallback = (
  /** 交叉目标 */
  target: Element,
  /** 交叉目标的根元素 */
  root: Element | undefined,
  /** 交叉观察器实例 */
  observer: IntersectionObserver
) => void;
type IntersectionObserverParams = {
  callback: IntersectionObserverCallback;
  rootMargin?: number;
  threshold?: number;
  once?: boolean;
};
/**
 * @author sonion
 * @description 视口交叉观察器hook
 * @param {IntersectionObserverParams} params - 观察器初始化参数
 * @param {IntersectionObserverCallback} params.callback - 加载回调。
 * @param {number} [params.rootMargin] - 提前多少px触发
 * @param {number} [params.threshold] - 被观察目标与观察区交叉多少触发，0-1
 * @param {boolean} [params.once] - 是否只触发一次
 */
export const useIntersectionObserver = ({
  callback,
  rootMargin = 100,
  threshold = 0,
  once = false,
}: IntersectionObserverParams) => {
  const observerRef = useRef<IntersectionObserver>();
  const [rootRef, setRootRef] = useCreateSafeRef<Element>();
  const latestCallback = useLatestCallback(callback);

  const options = useMemo(
    () => ({
      root: rootRef, // 要观察的区域，视口为null
      rootMargin: `${rootMargin}px`, // 将观察区域向外扩张多少。扩张后就提前交叉了
      threshold, // 被观察目标与观察区交叉多少触发，0-1
    }),
    [rootRef, rootMargin, threshold]
  );
  const [, , withPrevOptions] = useStaticState(options); // 纪录上一次的options，用于比较是否变化

  useEffect(
    () => () => {
      observerRef.current?.disconnect?.();
      observerRef.current = void 0;
    },
    [options]
  );

  const observe = useCallback(
    (el: Element | null) => {
      if (!el) return;
      // options变化，取消观察，重新生成观察器
      if (withPrevOptions() !== options) {
        observerRef.current?.disconnect?.();
        observerRef.current = void 0;
        withPrevOptions(options); // 纪录新值
      }

      observerRef.current ??= new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            latestCallback?.(entry.target, rootRef, observer);
            once && observer.unobserve?.(entry.target); // 取消观察, 因为只需要触发一次。反复触发可不取消
          }
        });
      }, options);
      observerRef.current?.unobserve?.(el); // 避免重复
      observerRef.current?.observe?.(el);
    },
    // rootRef 已经是options 依赖了
    // oxlint-disable-next-line react-hooks/exhaustive-deps react/react-compiler
    [options, once, latestCallback, withPrevOptions]
  );

  const unobserve = useCallback(
    (el: Element | null) => el && observerRef.current?.unobserve?.(el),
    []
  );

  const takeRecords = useCallback(
    () => observerRef.current?.takeRecords?.(),
    []
  );

  const disconnect = useCallback(() => observerRef.current?.disconnect?.(), []);
  return {
    rootRef,
    /** 设置观察区域 */
    setRootRef,
    /** 开始观察 */
    observe,
    /** 取消观察 */
    unobserve,
    /** 取消所有观察，用observe重新启用 */
    disconnect,
    /** 获取 未触发回调前，所有未处理的观察记录，触发后清空 */
    takeRecords,
  };
};

type ResizeObserverCallback = (
  /** 变化记录 */
  entry: ResizeObserverEntry,
  /** 观察器实例 */
  observer: ResizeObserver
) => void;
/**
 * @author sonion
 * @description 元素尺寸变化观察器hook
 * @param {ResizeObserverCallback} callback - 回调函数，参数为ResizeObserverEntry
 * @param {boolean} [once] - 是否只观察一次，默认false
 */
export const useResizeObserver = (
  callback: ResizeObserverCallback,
  once = false
) => {
  const observerRef = useRef<ResizeObserver>();
  const latestCallback = useLatestCallback(callback);

  useEffect(
    () => () => {
      observerRef.current?.disconnect?.(); // 上一次观察器取消，observe没有重新运行的话，观察就丢失了
      observerRef.current = void 0;
    },
    []
  );

  // ResizeObserver 重新生成对象，observe 不会更新，用 observe 做依赖可能造成
  // ResizeObserver 更新了，但没有重新观察。但理论上只有 StrictMode 模式下会重新生成对象
  // 且observe不是作为依赖，而是直接绑定dom或依赖其它重渲染会改变的状态就不会有问题。
  // 或用Set存下历史观察，重生成时恢复，但不能用WeakSet，非必要不建议
  /** 开始观察 因重新生成观察器observe不会更新，故不可以observe是否更新做依赖依据 */
  const observe = useCallback(
    (el: Element | null, options?: ResizeObserverOptions) => {
      if (!el) return;
      observerRef.current ??= new ResizeObserver(
        (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
          entries.forEach((entry) => {
            latestCallback?.(entry, observer);
          });
          once && observer.disconnect();
        }
      );
      observerRef.current?.unobserve?.(el); // 避免重复
      observerRef.current?.observe?.(el, options);
    },
    // oxlint-disable-next-line react/react-compiler
    [once, latestCallback]
  );

  /** 取消观察 */
  const unobserve = useCallback(
    (el: Element | null) => el && observerRef.current?.unobserve?.(el),
    []
  );

  /** 取消所有观察，用observe重新启用 */
  const disconnect = useCallback(() => observerRef.current?.disconnect?.(), []);

  return {
    /** 开始观察 因重新生成观察器observe不会更新，故不可以observe是否更新做依赖依据 */
    observe,
    /** 取消观察 */
    unobserve,
    /** 取消所有观察，用observe重新启用 */
    disconnect,
  };
};
