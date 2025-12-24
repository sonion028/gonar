# Tonar

**Tonar** 是一个现代前端工具库，提供常用的 **工具函数 (Utils)**、**React 钩子函数 (Hooks)** 和 **React 组件 (Components)**。

- ✅ 支持 **React 18+**
- ✅ 支持 **TypeScript**
- ✅ 仅支持 **ESM（不支持 CommonJS）**
- ✅ 支持 **Tree-shaking**

Tonar is a modern frontend library that provides **utility functions**, **React hooks**, and **React components**.

- ✅ Supports **React 18+**
- ✅ Supports **TypeScript**
- ✅ Only supports **ESM (does not support CommonJS)**
- ✅ Supports **Tree-shaking**

---

## 📦 Installation / 安装

```bash
npm install tonar@latest
pnpm add tonar@latest
yarn add tonar@latest
```

## 🚀 Usage / 使用方法

#### 📥 Unified Import（统一导入：utils、hooks、components）

```ts
import {
  Carousel,
  useDistinctState,
  rAfInterval,
  type RAfIntervalReturn,
  // ...other components、hooks、utils
} from 'tonar';
```

#### 🧩 Components / 组件

- Carousel （轮播组件，支持轮播项宽度小于容器宽度）
- CustomShow （条件展示组件）
- AsyncCustomShow （异步条件展示组件）
- ErrorBoundary （错误边界组件）

```js
import {
  Carousel,
  CustomShow,
  // ...other components
} from 'tonar/components';
```

#### 🔗 Hooks / 钩子函数

- useCreateSafeRef （安全引用，相同不更新，改变可触发更新, 支持自定义差异对比函数）
- useDistinctState （差异才更新的状态，支持onChange事件和自定义差异对比函数）
- useStaticState （静态属性，不触发react更新）
- useAsyncActionLock （异步操作锁，根据传入异步函数确定是否可再触发，并提供运行中状态）
- useInterval （定时器）
- useRAfInterval （RAf 定时器）
- useLatestCallback （保持稳定的最新回调，稳定引用函数与闭包获取新值不可兼得的问题）
- useIntersectionObserver （交叉观察器）
- useMutationObserver （节点变化观察器）
- useResizeObserver （尺寸变化观察器）
- useStorage （支持事件的本地存储）

```js
import {
  useCreateSafeRef,
  useDistinctState,
  // ...other hooks
} from 'tonar/hooks';
```

#### 🛠️ Utils / 工具函数

- debounce （防抖）
- safeAwait （安全 await，通过返回状态处理 reject 情况，避免 try-catch 嵌套）
- ConcurrencyController （并发控制器）
- deepClone （深拷贝，支持Set、Map、ExpReg、Date、循环引用）
- stringToHash （字符串转哈希值）
- browserNativeDownload （浏览器原生下载，支持检测是否被浏览器拦截）
- blobDownload （Blob 下载）
- extractChildrenListByType （获取 React 子节点中符合多个指定类型的节点数组）
- extractChildrenByType （获取 React 子节点中单个指定类型的节点）
- rAfInterval （RAf 定时器）
- clearRAfInterval （清除 RAf 定时器）

```js
import {
  debounce,
  ConcurrencyController,
  // ...other utils
} from 'tonar/utils';
```

## 📖 Example / 示例

#### 一个简单的 React 页面同时使用 Carousel 组件、Hook 和 Utils：

```tsx
import React from 'react';
import { Carousel, ErrorBoundary } from 'tonar/components';
import { useDistinctState } from 'tonar/hooks';
import { debounce } from 'tonar/utils';

export default function App() {
  // 支持onChange事件和自定义差异对比函数
  const [count, setCount] = useDistinctState({ initialValue: 0 });

  const handleClick = debounce(() => {
    setCount(count + 1); // 仅值不相等时更新
  }, 300);

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <h1>Tonar Demo</h1>
      <button onClick={handleClick}>Click Me ({count})</button>
      <Carousel cardWidth={200} cardHeight={120}>
        <div style={{ background: 'lightblue' }}>Slide 1</div>
        <div style={{ background: 'lightgreen' }}>Slide 2</div>
        <div style={{ background: 'lightpink' }}>Slide 3</div>
      </Carousel>
    </ErrorBoundary>
  );
}
```

## 📚 TypeScript tips / 类型导入提示

#### 从包根目录直接导入类型（例如组件 Props）：

```ts
import { type CarouselProps } from 'tonar';
```

#### 或按子路径导入（如果你更喜欢明确的来源）：

```ts
import type { CarouselProps } from 'tonar/components';
```

## 📝 License / 许可证

MIT © Sonion

欢迎 [Pull Requests](https://github.com/sonion028/tonar/pulls) 和 [Issues](https://github.com/sonion028/tonar/issues)  
源码仓库：[https://github.com/sonion028/tonar](https://github.com/sonion028/tonar)
