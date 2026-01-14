// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ExactTypedMap<T extends object> extends Omit<
  Map<keyof T, T[keyof T]>,
  'get' | 'set'
> {}

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
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class ExactTypedMap<T extends object> {
  private innerMap: Map<keyof T, T[keyof T]>;

  constructor(obj?: T) {
    this.innerMap = new Map<keyof T, T[keyof T]>(
      obj ? (Object.entries(obj) as [[keyof T, T[keyof T]]]) : []
    );
    // 创建 Proxy 实例，拦截属性/方法访问
    return new Proxy(this, {
      get(target, prop, receiver) {
        // 白名单：保留自定义的 get、set 方法
        // 自身有实现的优先返回自身实现
        if (
          prop === 'get' ||
          prop === 'set' ||
          Object.hasOwnProperty.call(target, prop)
        ) {
          return Reflect.get(target, prop, receiver);
        }

        // 自动转发其他属性/方法到内部 _map 实例
        const mapProperty =
          target.innerMap[prop as keyof Map<keyof T, T[keyof T]>];
        // 绑定 this 指向 _map，避免 Map 方法内部 this 丢失
        return typeof mapProperty === 'function'
          ? mapProperty.bind(target.innerMap)
          : mapProperty;
      },
    });
  }

  // 自定义的强类型 get 方法
  get<K extends keyof T>(key: K): T[K] | undefined {
    return this.innerMap.get(key) as T[K] | undefined;
  }

  // 自定义的强类型 set 方法
  set<K extends keyof T>(key: K, value: T[K]): void {
    this.innerMap.set(key, value);
  }
}
