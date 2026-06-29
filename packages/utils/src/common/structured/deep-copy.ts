/**
 * @author sonion
 * @description 获取元素的数据类型
 * @param {unknown} data - 要判断的参数
 * @returns {string} - 元素的数据类型
 */
const getObjectType = (() => {
  const regexp = /^\[[a-z]+ ([A-Za-z]+)\]$/;
  return (data: object) => {
    return (
      (data.constructor && data.constructor.name) ||
      Object.prototype.toString.call(data).replace(regexp, '$1')
    );
  };
})();

/**
 * @author sonion
 * @description 判断是否为对象
 * @param {unknown} val - 要判断的参数
 * @returns {boolean} - 是否为对象
 */
const isObject = <T extends object>(val: unknown): val is T =>
  val === Object(val);

/**
 * @author sonion
 * @description 判断是否为Set
 * @param {unknown} val - 要判断的参数
 * @returns {boolean} - 是否为Set
 */
const isSet = <T>(val: unknown): val is Set<T> => {
  if (!isObject(val)) return false;
  if (val instanceof Set) return true;
  return (
    Object.prototype.hasOwnProperty.call(val as object, 'size') &&
    typeof (val as Set<T>).add === 'function' &&
    typeof (val as Set<T>).has === 'function'
  );
};

/**
 * @author sonion
 * @description 判断是否为Map
 * @param {unknown} val - 要判断的参数
 * @returns {boolean} - 是否为Map
 */
const isMap = <K, V>(val: unknown): val is Map<K, V> => {
  if (!isObject(val)) return false;
  if (val instanceof Map) return true;
  return (
    Object.prototype.hasOwnProperty.call(val as object, 'size') &&
    typeof (val as Map<K, V>).set === 'function' &&
    typeof (val as Map<K, V>).get === 'function'
  );
};

// 深拷贝参数和返回类型
type DeepCloneResult = Record<string | symbol, unknown>;
type DeepCloneParamReturn = DeepCloneResult | Array<unknown>;
type ArrayElement<T> = T extends Array<infer U> ? U : never;
type SetElement<T> = T extends Set<infer U> ? U : never;
type MapElement<T> = T extends Map<infer K, infer V> ? [K, V] : never;

/**
 * @author sonion
 * @description 根据参数类型创建一个新的对象或集合或映射
 * @param {T} value - 要创建的参数
 */
const createResult = <T>(value: T) => {
  if (Array.isArray(value)) return [] as ArrayElement<T>[];
  if (isSet(value)) return new Set<SetElement<T>>();
  if (isMap(value)) return new Map<MapElement<T>[0], MapElement<T>[1]>();
  return {} as T;
};

/**
 * @author sonion
 * @description 解决了循环引用、原型一致的深度克隆 // 原生structuredClone 没解决Symbol、原型链，兼容到22年8月
 * @param {DeepCloneParamReturn} value 要克隆的对象
 * @param {boolean} [isCopyProto] 是否拷贝原型链 -默认值：true
 * @returns {DeepCloneParamReturn} - 克隆后的对象
 */
export const deepClone = <
  T extends DeepCloneParamReturn,
  U extends DeepCloneParamReturn,
>(
  value: T,
  isCopyProto = true
): U => {
  const cache = new WeakMap(); // 解决循环引用 weakMap不影响垃圾回收
  const _deepClone = <T>(value: T) => {
    if (!isObject(value)) return value;
    switch (getObjectType(value)) {
      case 'Date':
      case 'RegExp':
      case 'Function': {
        const constructor = value.constructor as new (
          ...args: unknown[]
        ) => unknown;
        return new constructor(value); // 用其构造函数传入 原数据或value.valueOf() 就能创建一个新的对象
      }
      case 'WeakMap':
      case 'WeakSet':
        return value;
    }
    if (cache.get(value)) return cache.get(value); // 解决循环引用
    const result = createResult(value);
    isCopyProto && Object.setPrototypeOf(result, Object.getPrototypeOf(value)); // 拷贝原型链
    cache.set(value, result); // 解决循环引用 把克隆过的保存。因为是递归，必须提前报存。否则后面的循环引用可能获取不到，一直进入下一层
    if (isSet(value)) {
      for (const v of value) {
        (result as Set<T>).add(_deepClone(v));
      }
      return result;
    }
    if (isMap(value)) {
      for (const [k, v] of value) {
        (result as Map<T, T>).set(_deepClone(k), _deepClone(v)); // Map key可以是对象，所以也要深拷贝
      }
      return result;
    }
    Reflect.ownKeys(value).map(
      (key) =>
        ((result as DeepCloneResult)[key] = _deepClone(
          (value as DeepCloneResult)[key]
        ))
    );
    return result;
  };
  return _deepClone(value);
};
