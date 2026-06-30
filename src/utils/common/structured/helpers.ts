/**
 * @author sonion
 * @param value 要判断的值
 * @description 是否为null或undefined
 */
export const isNil = (value: unknown): value is null | undefined =>
  value === null || value === void 0;

/**
 * @author sonion
 * @description 判断是否为对象
 * @param {unknown} val - 要判断的参数
 * @returns {boolean} - 是否为对象
 */
export const isObject = <T extends object>(val: unknown): val is T =>
  val === Object(val);

/**
 * @author sonion
 * @description 是否为纯对象
 * @param val 要判断的值
 * @returns 如果为纯对象则返回 true，否则返回 false
 */
export const isPlainObject = (val: unknown): val is Record<string, unknown> => {
  if (Object(val) !== val) return false;
  const proto = Object.getPrototypeOf(val);
  return proto === Object.prototype || isNil(proto);
};

/**
 * @author sonion
 * @description 判断是否为Set
 * @param {unknown} val - 要判断的参数
 * @returns {boolean} - 是否为Set
 */
export const isSet = <T>(val: unknown): val is Set<T> => {
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
export const isMap = <K, V>(val: unknown): val is Map<K, V> => {
  if (!isObject(val)) return false;
  if (val instanceof Map) return true;
  return (
    Object.prototype.hasOwnProperty.call(val as object, 'size') &&
    typeof (val as Map<K, V>).set === 'function' &&
    typeof (val as Map<K, V>).get === 'function'
  );
};
