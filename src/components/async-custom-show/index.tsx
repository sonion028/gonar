import { type FC, type ReactNode, type JSX, useEffect, useState } from 'react';

export type AsyncCustomShowProps<T> = {
  /** 异步判断 Promise */
  when: Promise<T> | undefined | null | false;
  /** 异步失败时的展示 */
  fallback?: ReactNode;
  /** 异步成功时的展示 */
  children: (value: T | undefined | null | false) => ReactNode;
};

export interface AsyncCustomShowType<T> extends FC<AsyncCustomShowProps<T>> {
  (props: AsyncCustomShowProps<T>): JSX.Element;
}

/**
 * @author sonion
 * @description 异步展示组件
 * @param {AsyncCustomShowProps<T>} props - 组件属性
 * @param {Promise<T> | undefined | null | false} props.when 异步判断 Promise
 * @param {ReactNode} [props.fallback] 异步失败时的展示
 * @param {(value: T | undefined | null | false) => ReactNode} props.children 异步成功时的展示
 */
function AsyncCustomShow<T>({
  when,
  fallback,
  children,
}: AsyncCustomShowProps<T>) {
  const [show, setShow] = useState<Awaited<typeof when>>(void 0);
  useEffect(() => {
    if (!when) return;
    let active = true;
    Promise.resolve(when).then((value) => active && setShow(value));
    return () => void (active = false);
  }, [when]);
  return <>{show ? children(show) : fallback}</>;
}

export default AsyncCustomShow;
