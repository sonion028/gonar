import type { RecordTypedMap } from '../collection/record-typed-map';

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
export type EventHandlerOptions = {
  /** 是否仅触发一次 */
  once?: boolean;
  /** 取消信号 */
  signal?: AbortSignal;
};

/** 事件处理函数集合 */
export type EventCollection<P> = Map<
  EventHandler<P>,
  EventHandlerOptions | undefined
>;

/**
 * @author sonion
 * @description 创建事件处理集合，同名事件的集合
 * 泛型 A，事件处理韩式参数类型
 * @returns 事件处理函数集合
 */
export const createEventCollection = <
  K extends keyof T,
  T extends Record<string, unknown>,
>(): EventCollection<T[K]> => new Map() satisfies EventCollection<T[K]>;

/** 事件中心数据类型 `Map<事件名, Map<事件处理函数, 配置参数>>` */
export type EventCenter<T extends Record<string, unknown>> = RecordTypedMap<{
  [K in keyof T]: EventCollection<T[K]>;
}>;

export type EventOptionExecutor<T extends Record<string, unknown>> = Record<
  keyof EventHandlerOptions,
  <K extends keyof T>(
    events: EventCenter<T>,
    eventName: K,
    // 在emit工程中传入，因为是引用类型，可用于控制执行过程。如signal信号终止不再运行，就删除处理函数
    eventExecutorParams: [EventHandler<T[K]>, EventHandlerOptions | undefined]
  ) => void
>;

export const createEventOptionExecutor = <
  T extends Record<string, unknown>,
>() =>
  ({
    // 删除事件中心的任务，但当次还要运行
    once: (events, eventName, eventExecutorParams) => {
      events.get(eventName)?.delete(eventExecutorParams[0]);
      events.get(eventName)?.size || events.delete(eventName); // 如果没有任务了，就删除该事件集合
    },
    signal: (events, eventName, eventExecutorParams) => {
      if (!(eventExecutorParams[1]?.signal instanceof AbortSignal))
        throw new TypeError(
          '参数 signal 类型错误。必须是一个 AbortSignal 对象'
        );
      if (eventExecutorParams[1].signal.aborted) {
        events.get(eventName)?.delete(eventExecutorParams[0]); // 删除事件中心的任务，且不再执行当次任务
        events.get(eventName)?.size || events.delete(eventName); // 如果没有任务了，就删除该事件集合
        Reflect.deleteProperty(eventExecutorParams, 0); // 索引不变
      }
    },
  }) satisfies EventOptionExecutor<T>;
