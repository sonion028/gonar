import type { FC, ReactNode, JSX, PropsWithChildren } from 'react';

export type CustomShowProps<T> = PropsWithChildren<{
  /** 判断条件 */
  when: T | null | undefined | false;
  /** 不满足条件时的渲染内容 */
  fallback?: ReactNode;
}>;

export interface CustomShowType<T> extends FC<CustomShowProps<T>> {
  (props: CustomShowProps<T>): JSX.Element;
}

/**
 * @author sonion
 * @description 根据条件渲染内容，替代用三目运算和短路规则条件渲染
 * @param {CustomShowProps<T>} props 组件属性
 * @param {T | null | undefined | false} props.when 条件
 * @param {ReactNode} props.fallback 不满足条件时的渲染内容
 * @param {(value: T | null | undefined | false) => ReactNode} props.children 满足条件时的渲染内容
 * @returns {JSX.Element} - 组件节点
 */
function CustomShow<T>({
  when,
  fallback = void 0,
  children,
}: CustomShowProps<T>): JSX.Element {
  return <>{when ? children : fallback}</>;
}

export default CustomShow;
