# @tonar/utils

`@tonar/utils` 是 Tonar 的框架无关工具函数包，提供异步控制、事件、对象处理、浏览器下载、XHR fetch 和 RAf 定时器等能力。

`@tonar/utils` is Tonar's framework-agnostic utility package for async control, events, object helpers, browser downloads, XHR-based fetch, and RAf timers.

- ✅ TypeScript 类型支持
- ✅ 仅支持 ESM（不支持 CommonJS）
- ✅ 支持 Tree-shaking
- ✅ 不依赖 React / Vue

## 📦 Installation / 安装

```bash
npm install @tonar/utils@latest
pnpm add @tonar/utils
yarn add @tonar/utils
```

## 🚀 Usage / 使用方法

```ts
import {
  ConcurrencyController,
  debounce,
  fetchXHR,
  rAfInterval,
  retryAsync,
  safeAwait,
} from '@tonar/utils';
```

## 🧩 Capabilities / 能力列表

- `safeAwait`：安全 await，通过返回状态处理 reject 情况，避免 try-catch 嵌套
- `promiseTry`：`Promise.try` 的 polyfill 实现，统一处理同步函数和 Promise
- `withResolver`：`Promise.withResolvers` 的 polyfill 实现，创建外部可解析的 Promise
- `ConcurrencyController`：并发控制器，限制同时运行的异步任务数量
- `retryAsync`：重试任务，支持重试次数、动态间隔时间，可指数退避或线性递增
- `takeLatest`：仅保留最新一次异步任务结果，适合搜索、筛选等竞态场景
- `EventEmitter`：事件中心，支持自定义调度器、API 对齐原生事件、类型安全的事件参数
- `createMicroQueueScheduler`：创建微队列调度器，将同一个同步执行阶段中的任务合并到一个微任务中执行
- `RecordTypedMap`：Record 类型化 Map，键和值的类型一一对应
- `deepClone`：深拷贝，支持 Set、Map、RegExp、Date、循环引用
- `isStructuredEqual`：比较两个结构化数据是否相等，引用不同，但值相等时返回 true
- `debounce`：防抖函数
- `stringToHash`：字符串转哈希值
- `convertSnake2Camel`：对象属性名从蛇形命名转小驼峰命名
- `convertCamel2Snake`：对象属性名从小驼峰命名转蛇形命名
- `convertPascal2Camel`：对象属性名从大驼峰命名转小驼峰命名
- `convertCamel2Pascal`：对象属性名从小驼峰命名转大驼峰命名
- `fetchXHR`：基于 XMLHttpRequest 的 fetch 实现，支持超时、取消请求、上传/下载进度回调
- `browserNativeDownload`：浏览器原生下载，支持检测是否被浏览器拦截
- `blobDownload`：Blob 下载
- `rAfInterval`：基于 `requestAnimationFrame` 的定时器
- `clearRAfInterval`：清除 RAf 定时器

## 📝 License / 许可证

MIT © Sonion

欢迎 [Pull Requests](https://github.com/sonion028/gonar/pulls) 和 [Issues](https://github.com/sonion028/gonar/issues)  
源码仓库：[https://github.com/sonion028/gonar](https://github.com/sonion028/gonar)
