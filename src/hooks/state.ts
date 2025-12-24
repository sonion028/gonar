import { useState, useCallback, useRef } from 'react';

/**
 * @author sonion
 * @description 创建静态的state, 不会触发组件重新渲染
 * @param {T} initialValue - 初始值
 */
export function useStaticState<T>(
  initialValue: T
): [() => T, (t: T) => void, (t?: T) => T];
export function useStaticState<T>(
  initialValue?: undefined
): [() => T | undefined, (t: T) => void, (t?: T) => T | undefined];
export function useStaticState<T>(initialValue?: T) {
  const ref = useRef<T>(initialValue as T);
  const getValue = useCallback(() => ref.current, []);
  const setValue = useCallback((t: T) => (ref.current = t), []);
  const withValue = useCallback(
    (t?: T) => (t === void 0 ? ref.current : (ref.current = t)),
    []
  );
  return [getValue, setValue, withValue];
}

/**
 * @author sonion
 * @description 创建最新的回调函数，不触发重新执行，同时避免闭包问题。
 * 作用类似19.2的useEffectEvent，但原理和用法不同。
 * @param {T} dep - 依赖函数、依赖函数数组、依赖函数对象
 * @returns {()=>T} - 获取最新回调函数、依赖函数数组、依赖函数对象的方法
 */
export function useLatestCallback<T extends (...args: never) => unknown>(
  dep: T
): () => T;
export function useLatestCallback<T extends (...args: never) => unknown>(
  dep?: T | undefined
): () => T | undefined;
export function useLatestCallback(dep: (...args: unknown[]) => unknown) {
  const ref = useRef(dep);
  // eslint-disable-next-line react-hooks/refs
  ref.current !== dep && (ref.current = dep);
  return useCallback(() => ref.current, []);
}

type SetStateAction<T> = (p?: T) => T;
type SetState<T> = T | SetStateAction<T>;

/**
 * @author sonion
 * @description 创建相同值不触发组件重新渲染的state。和useCreateSafeRef类似，但useCreateSafeRef更专注于ref
 * @param params - 参数对象
 * @param {T} params.initialValue - 初始值
 * @param {(val: T) => void} [params.onChange] - 变化回调
 * @param {(prev: T, next: T) => boolean} [params.hasDiff] - 对比函数，默认对比引用是否不相同。
 * @param {boolean} [params.onlyEvent] - 是否仅触发事件，不更新值，避免重渲染
 */
export function useDistinctState<T>(params: {
  initialValue: T | (() => T);
  onChange?: (val: T) => void;
  hasDiff?: (prev?: T, next?: T) => boolean;
  onlyEvent: true;
}): [undefined, (val: SetState<T>) => void, () => T];
export function useDistinctState<T>(params: {
  initialValue: T | (() => T);
  onChange?: (val: T) => void;
  hasDiff?: (prev?: T, next?: T) => boolean;
  onlyEvent?: false;
}): [T, (val: SetState<T>) => void, () => T];
export function useDistinctState<T>({
  initialValue,
  onChange,
  hasDiff = (prev, next) => prev !== next,
  onlyEvent,
}: {
  initialValue: T;
  onChange?: (val: T) => void;
  hasDiff?: (prev: T, next: T) => boolean;
  onlyEvent?: true | false;
}) {
  const prevRef = useRef<T>(void 0 as T);
  // 初始化只可能是函数，所以包一层，在这层一起初始化prevRef的值，避免初始化重复调用
  const initial = () =>
    (prevRef.current =
      typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue);
  const [value, setValue] = useState(initial);

  const getOnChange = useLatestCallback(onChange);
  const setValueDistinct = useCallback(
    (val: SetState<T>) => {
      const value =
        typeof val === 'function'
          ? (val as SetStateAction<T>)(prevRef.current)
          : val;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      hasDiff ??= (prev, next) => prev !== next;
      if (hasDiff(prevRef.current, value)) {
        const onChange = getOnChange();
        onChange?.(value);
        prevRef.current = value;
        onlyEvent || setValue(value); // 仅触发事件时，不更新值
      }
    },
    [getOnChange, onlyEvent, setValue, !!hasDiff]
  );
  return [
    onlyEvent ? void 0 : value, // 仅触发事件时，返回undefined
    setValueDistinct,
    useCallback(() => prevRef.current, []), // 获取上一次的值
  ] as const;
}

/**
 * @author sonion
 * @description 创建安全的Ref引用
 * @param {(oldNode?: T, newNode?: T) => boolean} [hasDiff] - 对比函数，默认对比引用是否不相同。
 */
export const useCreateSafeRef = <T extends object = HTMLElement>(
  hasDiff?: (oldNode?: T, newNode?: T) => boolean
) => {
  const [el, setEl] = useState<T>();
  const isReadyRef = useRef(false); // 是否赋值完成
  return [
    el,
    useCallback(
      (node: T | null) => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        hasDiff ??= (oldNode, newNode) => oldNode !== newNode;
        if (node && hasDiff(el, node)) {
          isReadyRef.current = true;
          setEl(node);
        }
      },
      [el, !!hasDiff] // 对比函数是否存在，对比函数又要稳定函数引用
    ),
    isReadyRef,
  ] as const;
};
