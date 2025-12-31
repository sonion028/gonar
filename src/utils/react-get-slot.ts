import {
  type ReactNode,
  type ComponentType,
  type ReactElement,
  isValidElement,
} from 'react';

const isReactNodeArray = (nodes: unknown): nodes is Array<ReactNode> =>
  Array.isArray(nodes);

const getComponentOfType = <T>(child: ReactNode) =>
  isValidElement(child) ? (child.type as ComponentType<T>) : null;

const isComponentOfType = <T>(child: ReactNode, component: ComponentType<T>) =>
  isValidElement(child) && child.type === component;

/**
 * @author sonion
 * @description 从子节点中获取指定类型节点
 * @param {ReactNode} children - 子节点
 * @param {ComponentType} component - 组件
 * @returns - 返回符合条件的ReactElement
 */
export const extractChildrenByType = <T>(
  children: ReactNode,
  component: ComponentType<T>
) => {
  if (isReactNodeArray(children)) {
    return children.find((node) => isComponentOfType(node, component));
  }
  return children && isComponentOfType(children, component) ? children : void 0;
};

/**
 * @author sonion
 * @description 从子节点中获取指定类型节点
 * @param {ReactNode} children - 子节点
 * @param {ComponentType<unknown>[]} args - 组件，多个组件时，返回符合条件的ReactElement数组
 * @returns {ReactElement[]} - 返回符合条件的ReactElement数组
 */
export const extractChildrenListByType = (
  children: ReactNode,
  ...args: ComponentType<unknown>[]
) => {
  if (isReactNodeArray(children)) {
    return children.reduce<ReactElement[]>((prev, cur) => {
      const comp = getComponentOfType(cur);
      if (!comp) {
        return prev;
      }
      const index = args.indexOf(comp);
      index >= 0 && (prev[index] = cur as ReactElement);
      return prev;
    }, []);
  }
  return args.map((comp) =>
    isComponentOfType(children, comp) ? children : void 0
  );
};
