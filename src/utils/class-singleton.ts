/**
 * @author sonion
 * @description 构造函数转单例工具
 * @param className - 要转单例的构造函数
 */
export const singleton = <
  T extends new (...args: ConstructorParameters<T>) => InstanceType<T> & object,
>(
  className: T
): T => {
  // 单例模式，生成函数
  let ins: InstanceType<T> & object;
  const proxy = new Proxy<T>(className, {
    construct(
      target: T,
      args: ConstructorParameters<T>
    ): InstanceType<T> & object {
      if (!ins) ins = new target(...args);
      else console.warn(`${className.name}为单例构造函数，只能有一个实例`);
      return ins;
    },
  });
  className.prototype.constructor = proxy;
  return proxy;
};
