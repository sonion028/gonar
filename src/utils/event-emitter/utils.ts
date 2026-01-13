/**
 * @author sonion
 * @description 判断对象自身是否有指定属性
 * @param obj 要判断的对象
 * @param property 属性名
 * @returns {boolean} - 是否有指定属性
 */
export const hasOwnProperty = <T extends Partial<Record<keyof T, unknown>>>(
  obj: T,
  property: string
) => Object.prototype.hasOwnProperty.call(obj, property);

/** 事件处理函数类型 */
export type EventHandler<P> = undefined extends P
  ? (payload?: P) => void
  : (payload: P) => void;

/** 事件处理函数配置类型 */
export type EventHandlerOptions = { once?: boolean; signal?: AbortSignal };

/** 事件处理函数集合 */
type EventCollection<P> = Map<EventHandler<P>, EventHandlerOptions | undefined>;

/**
 * @author sonion
 * @description 创建事件处理集合，同名事件的集合
 * 泛型 A，事件处理韩式参数类型
 * @returns 事件处理函数集合
 */
export const createEventCollection = <
  T extends Record<string, unknown>,
>(): EventCollection<T[keyof T]> =>
  new Map() satisfies EventCollection<T[keyof T]>;

/** 事件中心数据类型 `Map<事件名, Map<事件处理函数, 配置参数>>` */
export type EventCenter<
  T extends Record<string, unknown>,
  K extends keyof T,
> = Map<K, EventCollection<T[K]>>;

export type EventOptionExecutor<T extends Record<string, unknown>> = Record<
  keyof EventHandlerOptions,
  (
    events: EventCenter<T, keyof T>,
    eventName: keyof T,
    // 在emit工程中传入，因为是引用类型，可用于控制执行过程。如signal信号终止不再运行，就删除处理函数
    eventExecutorParams: readonly [
      EventHandler<T[keyof T]>,
      EventHandlerOptions | undefined,
    ]
  ) => void
>;

export const createEventOptionExecutor = <
  T extends Record<string, unknown>,
>() =>
  ({
    // 删除事件中心的任务，但当次还要运行
    once: (events, eventName, eventHandler) =>
      events.get(eventName)?.delete(eventHandler[0]),
    signal: (events, eventName, eventHandler) => {
      if (!(eventHandler[1]?.signal instanceof AbortSignal))
        throw new TypeError(
          '参数 signal 类型错误。必须是一个 AbortSignal 对象'
        );
      if (eventHandler[1].signal.aborted) {
        events.get(eventName)?.delete(eventHandler[0]); // 删除事件中心的任务，且不再执行当次任务
        Reflect.deleteProperty(eventHandler, 0); // 索引不变
      }
    },
  }) satisfies EventOptionExecutor<T>;
