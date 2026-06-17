# @tonar/react-kit

`@tonar/react-kit` 是 Tonar 的 React 18 组件和 Hooks 包，提供轮播、条件渲染、错误边界、状态辅助、观察器、存储、定时器和异步操作锁等能力。

`@tonar/react-kit` is Tonar's React 18 component and hooks package for carousel, conditional rendering, error boundaries, state helpers, observers, storage, timers, and async action locking.

- ✅ 支持 React 18+
- ✅ TypeScript 类型支持
- ✅ 仅支持 ESM（不支持 CommonJS）
- ✅ 支持 Tree-shaking

## 📦 Installation / 安装

```bash
npm install @tonar/react-kit@latest
pnpm add @tonar/react-kit
yarn add @tonar/react-kit
```

## 🚀 Usage / 使用方法

```tsx
import React from 'react';
import { Carousel, ErrorBoundary } from '@tonar/react-kit/components';
import { useDistinctState } from '@tonar/react-kit/hooks';

export default function App() {
  const [count, setCount] = useDistinctState({ initialValue: 0 });

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <button onClick={() => setCount(count + 1)}>Click Me ({count})</button>
      <Carousel cardWidth={200} cardHeight={120}>
        <div style={{ background: 'lightblue' }}>Slide 1</div>
        <div style={{ background: 'lightgreen' }}>Slide 2</div>
        <div style={{ background: 'lightpink' }}>Slide 3</div>
      </Carousel>
    </ErrorBoundary>
  );
}
```

## 🧩 Components / 组件

- `Carousel`：轮播组件，支持自动播放、无缝轮播、指示器、自定义箭头、非循环结束回调等
- `CustomShow`：条件展示组件，替代常见三目运算和短路规则条件渲染
- `AsyncCustomShow`：异步条件展示组件，根据 Promise 结果展示内容或 fallback
- `ErrorBoundary`：错误边界组件，用于捕获子组件错误并显示自定义回退内容

## 🔗 Hooks / 钩子函数

- `useDistinctState`：差异才更新的状态，支持 `onChange` 事件和自定义差异对比函数
- `useStaticState`：静态状态，不触发 React 更新
- `useCreateSafeRef`：安全引用，相同节点不更新，改变时可触发更新，支持自定义差异对比函数
- `useLatestCallback`：保持稳定的最新回调，解决稳定函数引用和闭包获取新值不可兼得的问题
- `useAsyncActionLock`：异步操作锁，根据传入异步函数确定是否可再触发，并提供运行中状态
- `useIntersectionObserver`：交叉观察器 Hook
- `useMutationObserver`：节点变化观察器 Hook
- `useResizeObserver`：尺寸变化观察器 Hook
- `useInterval`：自管理定时器 Hook
- `useRAfInterval`：基于 `requestAnimationFrame` 的定时器 Hook
- `useStorage`：支持事件同步的本地存储 Hook

## 📚 TypeScript tips / 类型导入提示

```ts
import type { CarouselProps } from '@tonar/react-kit/components';
```

## 📝 License / 许可证

MIT © Sonion

欢迎 [Pull Requests](https://github.com/sonion028/gonar/pulls) 和 [Issues](https://github.com/sonion028/gonar/issues)  
源码仓库：[https://github.com/sonion028/gonar](https://github.com/sonion028/gonar)
