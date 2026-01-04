/**
 * @author sonion
 * @description 将小驼峰（camelCase）字符串转换为大驼峰（PascalCase）
 * @param str 小驼峰格式的字符串
 * @returns 大驼峰格式的字符串
 */
const camel2Pascal = (str: string) => {
  if (!str) {
    return str;
  }
  // 将首字母转为大写，其余保持不变
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * @author sonion
 * @description 将大驼峰（PascalCase）字符串转换为小驼峰（camelCase）
 * @param str 大驼峰格式的字符串
 * @returns 小驼峰格式的字符串
 */
const pascal2Camel = (str: string) => {
  if (!str) {
    return str;
  }
  // 将首字母转为小写，其余保持不变
  return str.charAt(0).toLowerCase() + str.slice(1);
};

/**
 * @author sonion
 * @description 将小驼峰命名（camelCase）字符串转换为蛇形命名（snake_case）
 * @param str 小驼峰格式的字符串
 * @returns 蛇形格式的字符串
 */
const camel2Snake = (str: string) => {
  if (!str) {
    return str;
  }
  return (
    str
      // 在大写字母前加下划线
      .replace(/([A-Z])/g, '_$1')
      // 转成小写
      .toLowerCase()
      // 去掉可能出现在开头的下划线
      .replace(/^_/, '')
  );
};

/**
 * @author sonion
 * @description 将蛇形命名（snake_case）字符串转换为小驼峰（camelCase）
 * @param str 蛇形命名格式的字符串
 * @returns 小驼峰格式的字符串
 */
const snake2Camel = (str: string) => {
  if (!str) {
    return str;
  }
  // 将下划线后的字母转为大写，并删除下划线
  // 匹配下划线后的字母，将字母转为大写；如果是数字，只删除下划线
  return str
    .replace(/_([a-zA-Z])/g, (_, letter) => letter.toUpperCase())
    .replace(/_(\d+)/g, (_, digit) => digit)
    .replace(/_/g, ''); // 删除所有剩余的下划线
};

/**
 * @author sonion
 * @description 深度遍历 JSON，将所有键名按指定的转换函数处理
 * @param params 参数对象
 * @param params.obj 要处理的 JSON 对象或数组
 * @param params.convertFn 键名转换方法，默认值为 identity（不转换）
 * @param params.ignoreKeys 要忽略的键名集合，默认值为空集合
 * @returns 处理后的 JSON 对象或数组
 */
const convertKeysDeep = <
  T extends Record<keyof T, unknown> | Record<keyof T, unknown>[],
  R extends string,
>({
  obj,
  ignoreKeys = new Set(),
  convertFn,
}: {
  obj: T;
  ignoreKeys?: Set<string>;
  convertFn: (key: string) => R;
}): T => {
  if (Object(obj) !== obj) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      convertKeysDeep({ obj: item, ignoreKeys, convertFn })
    ) as unknown as T;
  }

  const converted: Record<string, unknown> = {};
  const entries = Object.entries(obj);
  for (const [key, value] of entries) {
    const newKey = ignoreKeys.has(key) ? key : convertFn(key);
    converted[newKey] = convertKeysDeep({ obj: value, ignoreKeys, convertFn });
  }
  return converted as T;
};

/** 小驼峰命名支持用小划线分割 */
type CamelToSnakeRaw<S extends string> = S extends `${infer First}${infer Rest}`
  ? First extends Lowercase<First>
    ? `${First}${CamelToSnakeRaw<Rest>}`
    : `_${Lowercase<First>}${CamelToSnakeRaw<Rest>}`
  : S;

/** 去掉开头的下划线 */
type TrimLeadingUnderscore<S extends string> = S extends `_${infer R}` ? R : S;

/** 小驼峰命名转换为蛇形命名类型 */
type CamelToSnake<S extends string> = TrimLeadingUnderscore<CamelToSnakeRaw<S>>;

/** 蛇形命名转换为小驼峰命名类型 */
type SnakeToCamel<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Lowercase<Head>}${Capitalize<SnakeToCamel<Tail>>}`
  : Lowercase<S>;

/** 小驼峰命名转换为大驼峰命名类型 */
type CamelToPascal<S extends string> = Capitalize<S>;
/** 大驼峰命名转换为小驼峰命名类型 */
type PascalToCamel<S extends string> = Uncapitalize<S>;

/** 转换模式 */
export const ConvertMode = {
  SnakeToCamel: 'snakeToCamel',
  CamelToSnake: 'camelToSnake',
  CamelToPascal: 'camelToPascal',
  PascalToCamel: 'pascalToCamel',
} as const;
/** 转换模式类型 */
export type ConvertMode = (typeof ConvertMode)[keyof typeof ConvertMode];
// 类型和值一样，erasableSyntaxOnly 模式下 enum 的替代

type ApplyKeyTransform<
  M extends ConvertMode,
  K extends string,
> = M extends typeof ConvertMode.SnakeToCamel
  ? SnakeToCamel<K>
  : M extends typeof ConvertMode.CamelToSnake
    ? CamelToSnake<K>
    : M extends typeof ConvertMode.CamelToPascal
      ? CamelToPascal<K>
      : M extends typeof ConvertMode.PascalToCamel
        ? PascalToCamel<K>
        : K;

/** 通用：深度转换对象所有键名（保留函数与数组）*/
type ConvertKeys<
  T,
  M extends ConvertMode,
  IGN extends readonly string[] = readonly [],
> = T extends (...args: never) => unknown
  ? T
  : T extends readonly unknown[]
    ? { [I in keyof T]: ConvertKeys<T[I], M, IGN> }
    : T extends object
      ? {
          [K in keyof T as K extends string
            ? K extends IGN[number]
              ? K
              : ApplyKeyTransform<M, K>
            : K]: ConvertKeys<T[K], M, IGN>;
        }
      : T;

/**
 * @author sonion
 * @description 深度遍历JSON，将所有键名从蛇形转换为小驼峰
 * @param obj 要处理的JSON对象或数组
 * @param ignoreKeys 忽略转换的键名数组
 */
const convertSnake2Camel = <
  T extends Record<keyof T, unknown> | Record<keyof T, unknown>[],
  K extends readonly string[] = readonly [],
>(
  obj: T,
  ignoreKeys?: K
): ConvertKeys<T, typeof ConvertMode.SnakeToCamel, K> => {
  return convertKeysDeep({
    obj,
    ignoreKeys: new Set(ignoreKeys ?? []),
    convertFn: snake2Camel,
  }) as ConvertKeys<T, typeof ConvertMode.SnakeToCamel, K>;
};

/**
 * @author sonion
 * @description 深度遍历JSON，将所有键名从小驼峰转换为蛇形
 * @param obj 要处理的JSON对象或数组
 * @param ignoreKeys 忽略转换的键名数组
 */
const convertCamel2Snake = <
  T extends Record<keyof T, unknown> | Record<keyof T, unknown>[],
  K extends readonly string[] = readonly [],
>(
  obj: T,
  ignoreKeys?: K
): ConvertKeys<T, typeof ConvertMode.CamelToSnake, K> => {
  return convertKeysDeep({
    obj,
    ignoreKeys: new Set(ignoreKeys ?? []),
    convertFn: camel2Snake,
  }) as ConvertKeys<T, typeof ConvertMode.CamelToSnake, K>;
};

/**
 * @author sonion
 * @description 深度遍历JSON，将所有键名从小驼峰转换为大驼峰
 * @param obj 要处理的JSON对象或数组
 * @param ignoreKeys 忽略转换的键名数组
 */
const convertCamel2Pascal = <
  T extends Record<keyof T, unknown> | Record<keyof T, unknown>[],
  K extends readonly string[] = readonly [],
>(
  obj: T,
  ignoreKeys?: K
): ConvertKeys<T, typeof ConvertMode.CamelToPascal, K> => {
  return convertKeysDeep({
    obj,
    ignoreKeys: new Set(ignoreKeys ?? []),
    convertFn: camel2Pascal,
  }) as ConvertKeys<T, typeof ConvertMode.CamelToPascal, K>;
};

/**
 * @author sonion
 * @description 深度遍历JSON，将所有键名从大驼峰转换为小驼峰
 * @param obj 要处理的JSON对象或数组
 * @param ignoreKeys 忽略转换的键名数组
 */
const convertPascal2Camel = <
  T extends Record<keyof T, unknown> | Record<keyof T, unknown>[],
  K extends readonly string[] = readonly [],
>(
  obj: T,
  ignoreKeys?: K
): ConvertKeys<T, typeof ConvertMode.PascalToCamel, K> => {
  return convertKeysDeep({
    obj,
    ignoreKeys: new Set(ignoreKeys ?? []),
    convertFn: pascal2Camel,
  }) as ConvertKeys<T, typeof ConvertMode.PascalToCamel, K>;
};

export {
  convertSnake2Camel,
  convertCamel2Snake,
  convertCamel2Pascal,
  convertPascal2Camel,
};
