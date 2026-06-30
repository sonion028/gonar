import {
  type EventHandler,
  type EventHandlerOptions,
  type EventOptionExecutor,
  type EventCenter,
  createEventCollection,
  createEventOptionExecutor,
  hasOwnProperty,
} from './helpers';
import { RecordTypedMap } from '../collection/record-typed-map';
import { createMicroQueueScheduler } from '../tasks/micro-queue-scheduler';

// 定义一个排除函数的类型
type NonFunction =
  | null
  | undefined
  | number
  | string
  | boolean
  | symbol
  | bigint
  | { [key: string]: unknown };

/** 返回包含 undefined 类型的键 */
type KeysWithUndefined<T> = {
  // 遍历 T 的所有键 K，如可选会是和 undefined 的联合类型
  // 所以用 undefined extends T[K] 来判断是否包含 undefined
  [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

/** 返回不包含 undefined 类型的键 */
type KeysWithoutUndefined<T> = {
  [K in keyof T]: undefined extends T[K] ? never : K;
}[keyof T];

/**
 * @author sonion
 * @description 自定义事件中心。
 * @example
 * const eventCenter = new EventEmitter();
 * eventCenter.on('onChange', data=>console.log('没有配置的事件。参数：', data));
 * eventCenter.on('onTest', data=>console.log('once 配置为 true 的事件。参数：', data), {once: true});
 * const controller = new AbortController(); // 创建取消信号
 * eventCenter.on('tap', data=>console.log('配置了 signal 的事件。参数：', data), {signal: controller.signal})
 * controller.abort() // 取消
 * eventCenter.emit('onChange', {happy: true});
 */
export class EventEmitter<T extends Record<string, NonFunction>> {
  /** Map<事件名, Map<事件处理函数, 配置参数>> */
  private events: EventCenter<T> = new RecordTypedMap();

  /** 配置对象执行器，不同配置参数的不同处理。在emit中执行 */
  private eventOptionExecutor: EventOptionExecutor<T>;

  /** 自定义调度器，怎么执行事件处理函数 */
  private scheduler: (eventHandel: () => void) => void;

  constructor(scheduler?: (eventHandel: () => void) => void) {
    this.scheduler = scheduler ?? createMicroQueueScheduler();
    // 事件处理 options 执行器。如需添加处理参数，直接扩展 createEventOptionExecutor 返回对象属性
    this.eventOptionExecutor = createEventOptionExecutor<T>();
  }

  /**
   * @author sonion
   * @description 注册事件
   * @param eventName 事件名
   * @param callback 事件处理函数
   * @param options 配置对象。once：是否只运行一次, signal取消信号
   */
  addEventListener<K extends keyof T>(
    eventName: K,
    callback: EventHandler<T[K]>,
    options?: EventHandlerOptions
  ): void {
    if (options) {
      const keys = Object.keys(this.eventOptionExecutor);
      if (typeof options !== 'object' || Array.isArray(options)) {
        throw new TypeError(
          '参数 options 类型错误。options 应该为一个配置对象。'
        );
      } else if (!keys.some((key) => hasOwnProperty(options, key))) {
        throw new TypeError(`options 仅支持 ${keys.join('、')} 参数`);
      }
    }
    // events 为用class 包装的 Map 类型更友好
    this.events.has(eventName) ||
      this.events.set(eventName, createEventCollection<K, T>());
    const collection = this.events.get(eventName);
    collection?.set(callback, options);
  }

  /**
   * @author sonion
   * @description 移除事件
   * @param eventName 事件名
   * @param callback 事件处理函数
   */
  removeEventListener<K extends keyof T>(
    eventName: K,
    callback: EventHandler<T[K]>
  ) {
    if (!this.events.has(eventName)) return;
    this.events.get(eventName)?.delete(callback);
  }

  // 添加事件 别名
  on<K extends keyof T>(
    eventName: K,
    callback: EventHandler<T[K]>,
    options?: EventHandlerOptions
  ) {
    this.addEventListener(eventName, callback, options);
  }

  // 移除事件 别名
  off<K extends keyof T>(eventName: K, callback: EventHandler<T[K]>) {
    this.removeEventListener(eventName, callback);
  }

  /**
   * @author sonion
   * @description 清空事件列表
   * @param {string | void} [eventName] - 要清除的事件名。不传就清空所有事件列表
   */
  clear(eventName?: keyof T) {
    if (eventName) {
      return this.events.delete(eventName);
    }
    return this.events.clear() ?? true;
  }

  /**
   * @author sonion
   * @description 发布事件
   * @param eventName 事件名
   * @param data 事件参数
   */
  emit<K extends KeysWithoutUndefined<T>>(eventName: K, data: T[K]): void;
  emit<K extends KeysWithUndefined<T>>(eventName: K, data?: T[K]): void;
  emit<K extends keyof T>(eventName: K, data?: T[K]) {
    if (!this.events.has(eventName)) return;
    // 遍历订阅对象，执行handler
    this.scheduler(() => {
      this.events.get(eventName)?.forEach((options, callback) => {
        const eventExecutorParams: [
          EventHandler<T[K]>,
          EventHandlerOptions | undefined,
        ] = [callback, options];

        if (options) {
          const optionKeys = Object.keys(
            options
          ) as (keyof EventHandlerOptions)[];
          optionKeys.forEach((key) => {
            hasOwnProperty(this.eventOptionExecutor, key) &&
              this.eventOptionExecutor[key](
                this.events,
                eventName,
                eventExecutorParams
              );
          });
        }
        // 可能执行时事件可能已经被移除
        // 利用 eventExecutorParams 是数组的引用类型特征
        // eventOptionExecutor 处理后 eventHandler 内还存在才运行
        eventExecutorParams[0] && callback(data as T[K]); // 必须在最后
      });
    });
  }
}
