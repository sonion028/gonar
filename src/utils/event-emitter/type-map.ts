// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TypedMap<T extends object> extends Omit<
  Map<keyof T, T[keyof T]>,
  'get' | 'set'
> {}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class TypedMap<T extends object> {
  private _map: Map<keyof T, T[keyof T]>;

  constructor(obj?: T) {
    this._map = new Map<keyof T, T[keyof T]>(
      obj ? (Object.entries(obj) as [[keyof T, T[keyof T]]]) : []
    );

    // 创建 Proxy 实例，拦截属性/方法访问
    return new Proxy(this, {
      get(target, prop, receiver) {
        // 白名单：保留自定义的 get、set 方法，优先返回自身实现
        if (prop === 'get' || prop === 'set') {
          return Reflect.get(target, prop, receiver);
        }

        // 自动转发其他属性/方法到内部 _map 实例
        const mapProperty = target._map[prop as keyof Map<keyof T, T[keyof T]>];
        // 绑定 this 指向 _map，避免 Map 方法内部 this 丢失
        return typeof mapProperty === 'function'
          ? mapProperty.bind(target._map)
          : mapProperty;
      },
    });
  }

  // 保留自定义的强类型 get 方法
  get<K extends keyof T>(key: K): T[K] | undefined {
    return this._map.get(key) as T[K] | undefined;
  }

  // 保留自定义的强类型 set 方法
  set<K extends keyof T>(key: K, value: T[K]): void {
    this._map.set(key, value);
  }
}
