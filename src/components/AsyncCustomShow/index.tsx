import { type FC, type ReactNode, type JSX, useEffect, useState } from 'react';

export type AsyncCustomShowProps<T> = {
  when: Promise<T> | undefined | null | false;
  fallback?: ReactNode;
  children: (value: T | undefined | null | false) => ReactNode;
};

export interface AsyncCustomShowType<T> extends FC<AsyncCustomShowProps<T>> {
  (props: AsyncCustomShowProps<T>): JSX.Element;
}

/**
 * @author sonion
 * @description 异步展示组件
 * @param {AsyncCustomShowProps<T>} props - 组件属性
 * @param {Promise<T> | undefined | null | false} props.when 异步 Promise
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
    Promise.resolve(when).then(setShow);
  }, [when]);
  return <>{show ? children(show) : fallback}</>;
}

export default AsyncCustomShow;
