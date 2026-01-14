/**
 * @author sonion
 * @description 一个带有精确类型约束的 Map。
 *
 * 与普通 `Map<keyof T, T[keyof T]>` 不同，
 * 它保证键和值的类型一一对应：
 * - 键只能是对象 T 的属性名
 * - 值必须是该属性对应的类型
 *
 * 这样可以避免宽泛的联合类型，提供类似对象的强类型体验。
 * @example
 * interface Config {
 *   port: number;
 *   host: string;
 * }
 *
 * const map = new ExactTypedMap<Config>();
 * map.set("port", 3000);   // ✅ 正确
 * map.set("host", "localhost"); // ✅ 正确
 * map.set("port", "oops"); // ❌ 类型错误
 */
export class ExactTypedMap<T extends object> extends Map<keyof T, T[keyof T]> {
  constructor(obj?: T) {
    super(obj ? (Object.entries(obj) as [[keyof T, T[keyof T]]]) : []);
    // 创建 Proxy 实例，拦截属性/方法访问
  }

  // 自定义的强类型 get 方法
  get<K extends keyof T>(key: K): T[K] | undefined {
    return super.get(key) as T[K];
  }

  // 自定义的强类型 set 方法
  set<K extends keyof T>(key: K, value: T[K]) {
    return super.set(key, value);
  }
}
