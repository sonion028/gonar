# Tonar

**Tonar** 是一个 TypeScript 优先、仅支持 ESM 的前端工具库 monorepo，包含框架无关的工具函数，以及面向 React 和 Vue 的轻量 UI 工具包。

Tonar is a TypeScript-first, ESM-only frontend utility monorepo with framework-agnostic utilities plus lightweight React and Vue toolkits.

- ✅ TypeScript 类型支持
- ✅ 仅支持 ESM（不支持 CommonJS）
- ✅ 支持 Tree-shaking
- ✅ 按需选择独立子包

---

## 📦 Packages / 子包

根 README 只做总览。各包的具体能力、安装方式和示例请进入对应子包 README 查看。

| Package                                    | Description                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------ |
| [`@tonar/utils`](./packages/utils)         | 框架无关工具函数包，提供异步控制、事件、对象转换、下载、XHR fetch 等能力 |
| [`@tonar/react-kit`](./packages/react-kit) | React 18 组件和 Hooks 包，提供 React 专用 UI 与状态/观察器等能力         |
| [`@tonar/react`](./packages/react)         | React 使用入口，适合在 React 项目中使用 Tonar                            |
| [`@tonar/vue-kit`](./packages/vue-kit)     | Vue 3 组件包，提供 Vue3 组件和组合式函数                                 |
| [`@tonar/vue`](./packages/vue)             | Vue 使用入口，适合在 Vue 项目中使用 Tonar                                |

## 🧩 Installation / 安装

按需安装对应子包：

```bash
pnpm add @tonar/utils
pnpm add @tonar/react
pnpm add @tonar/vue
```

也可以安装更细粒度的 kit 包：

```bash
pnpm add @tonar/react-kit
pnpm add @tonar/vue-kit
```

## 📚 Documentation / 文档入口

- 通用工具函数：[`@tonar/utils`](./packages/utils)
- React 组件和 Hooks：[`@tonar/react-kit`](./packages/react-kit)
- React 使用入口：[`@tonar/react`](./packages/react)
- Vue 组件和 Composables：[`@tonar/vue-kit`](./packages/vue-kit)
- Vue 使用入口：[`@tonar/vue`](./packages/vue)

## 📝 License / 许可证

MIT © Sonion

欢迎 [Pull Requests](https://github.com/sonion028/gonar/pulls) 和 [Issues](https://github.com/sonion028/gonar/issues)  
源码仓库：[https://github.com/sonion028/gonar](https://github.com/sonion028/gonar)
