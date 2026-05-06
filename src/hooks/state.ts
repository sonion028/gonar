import { type SetStateAction, useState, useCallback, useRef } from 'react';

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
  return [getValue, setValue, withValue] as const;
}

/**
 * @author sonion
 * @description 创建最新的回调函数，不触发重新执行，同时避免闭包问题。
 * 作用类似 React 19 的 useEffectEvent，但原理不同。
 * @param {T} cb - 依赖函数、依赖函数数组、依赖函数对象
 * @returns {T} - 返回稳定的函数引用，始终调用最新的 cb
 */
export function useLatestCallback<T extends (...args: never[]) => unknown>(
  cb: T
): T;
export function useLatestCallback<T extends (...args: never[]) => unknown>(
  cb?: T | undefined
): T | undefined;
export function useLatestCallback(cb: (...args: unknown[]) => unknown) {
  const ref = useRef(cb);
  // 注意：在渲染期间更新 ref.current 是 React 官方认可的模式。
  // 参考：React 19 useEffectEvent 实现、Dan Abramov 的博客文章。
  // https://overreacted.io/making-setinterval-declarative-with-react-hooks/
  // https://jser.dev/react/2023/03/18/useeffectevent/
  // https://www.epicreact.dev/the-latest-ref-pattern-in-react
  // 这是实现"稳定引用 + 最新值"语义的标准做法。
  // ESLint 规则 react-hooks/refs 对此场景存在误判，故禁用。
  // eslint-disable-next-line react-hooks/refs
  ref.current !== cb && (ref.current = cb);
  type Args = Parameters<typeof cb>;
  return useCallback((...args: Args) => ref.current?.(...args), []);
}

/**
 * @author sonion
 * @description 创建相同值不触发组件重新渲染的state。和useCreateSafeRef类似，但useCreateSafeRef更专注于ref
 * @param params - 参数对象
 * @param {T} params.initialValue - 初始值
 * @param {(val: T) => void} [params.onChange] - 变化回调
 * @param {(prev: T, next: T) => boolean} [params.hasDiff] - 对比函数，返回true变更生效。默认对比引用是否不相同。
 * @param {boolean} [params.onlyEvent] - 是否仅触发事件，不更新值，避免重渲染
 */
export function useDistinctState<T>(params: {
  initialValue: T | (() => T);
  onChange?: (val: T) => void;
  hasDiff?: (prev?: T, next?: T) => boolean;
  onlyEvent: true;
}): [undefined, (val: SetStateAction<T>) => void, () => T];
export function useDistinctState<T>(params: {
  initialValue: T | (() => T);
  onChange?: (val: T) => void;
  hasDiff?: (prev?: T, next?: T) => boolean;
  onlyEvent?: false;
}): [T, (val: SetStateAction<T>) => void, () => T];
export function useDistinctState<T>({
  initialValue,
  onChange,
  hasDiff = (prev, next) => prev !== next,
  onlyEvent,
}: {
  /** 初始值 */
  initialValue: T;
  /** 变化回调 */
  onChange?: (val: T) => void;
  /** 对比函数，默认对比引用是否不相同。 */
  hasDiff?: (prev: T, next: T) => boolean;
  /** 是否仅触发事件，不更新值，避免重渲染 */
  onlyEvent?: true | false;
}) {
  const prevRef = useRef<T>(void 0 as T);
  // 初始化只可能是函数，所以包一层，在这层一起初始化 prevRef 的值，避免初始化重复调用
  const initial = () =>
    (prevRef.current =
      typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue);
  // 注意：ESLint 规则 react-hooks/refs 误判了此场景。
  // useState 的初始化函数只在组件挂载时执行一次，此时修改 prevRef.current 是安全的。
  // eslint-disable-next-line react-hooks/refs
  const [value, setValue] = useState(initial);
  const latestOnChange = useLatestCallback(onChange);
  const depHasDiff = !!hasDiff; // 直接放依赖中，lint会报错
  const setValueDistinct = useCallback(
    (val: SetStateAction<T>) => {
      const value =
        typeof val === 'function'
          ? (val as (prevState: T) => T)(prevRef.current)
          : val;
      const isDiff = hasDiff ?? ((prev, next) => prev !== next);
      if (isDiff(prevRef.current, value)) {
        latestOnChange?.(value);
        prevRef.current = value;
        onlyEvent || setValue(value); // 仅触发事件时，不更新值
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [latestOnChange, onlyEvent, setValue, depHasDiff]
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
 * @param {(oldNode?: T, newNode?: T) => boolean} [hasDiff] - 对比函数，返回true变更生效。默认对比引用是否不相同。
 */
export const useCreateSafeRef = <T extends object = HTMLElement>(
  hasDiff?: (oldNode?: T, newNode?: T) => boolean
) => {
  const [el, setEl] = useState<T>();
  const isReadyRef = useRef(false); // 是否赋值完成
  const depHasDiff = !!hasDiff; // 直接放依赖中，lint会报错
  const safeRef = useCallback(
    (node: T | null) => {
      const isDiff = hasDiff ?? ((oldNode, newNode) => oldNode !== newNode);
      if (node && isDiff(el, node)) {
        isReadyRef.current = true;
        setEl(node);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [el, depHasDiff] // 对比函数是否存在，对比函数又要稳定函数引用
  );

  return [el, safeRef, isReadyRef] as const;
};
