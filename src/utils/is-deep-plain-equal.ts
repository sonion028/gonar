/**
 * @author sonion
 * @param value 要判断的值
 * @description 是否为null或undefined
 */
export const isNil = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

/**
 * @author sonion
 * @description 深度比较两个未知类型的值是否相等。支持 Plain Object。
 * 不支持比较函数、Symbol、Date、RegExp等。
 * @param a 要比较的第一个值
 * @param b 要比较的第二个值
 * @returns 如果两个值相等则返回 true，否则返回 false
 */
export const isDeepPlainEqual = (a: unknown, b: unknown): boolean => {
  if (isNil(a) || isNil(b)) return Object.is(a, b);
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0, length = a.length; i < length; i++) {
      // 可能有顺序不一致问题
      if (!isDeepPlainEqual(a[i], b[i])) return false;
    }
    return true;
  }
  // 不支持比较函数、Symbol、Date、RegExp等
  if (typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
      if (!Object.hasOwnProperty.call(b, key)) return false; // 解决无属性和有属性但值为 undefined 的情况
      if (
        !isDeepPlainEqual(a[key as keyof typeof a], b[key as keyof typeof b])
      ) {
        return false;
      }
    }
    return true;
  }
  return false;
};
