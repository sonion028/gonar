# TypeScript 7.0.1-rc 兼容性分析报告

> 生成日期: 2026-06-27
> 当前 TypeScript 版本: ^6.0.3

## 核心问题

TS 7.0.1-rc 移除了 `package.json` 中的根路径 `"."` export，改为纯 ESM + 子路径导出（`typescript/unstable/sync` 等）。这意味着所有使用 `import ts from "typescript"`、`import * as ts from "typescript"`、`require("typescript")` 或 `import { createProgram } from "typescript"` 的代码都会**直接崩溃**。

## 受影响的项目依赖（按严重程度排序）

### 🔴 严重：直接导入 TypeScript 编译器 API

| 包 | 你安装的版本 | 最新 npm 版本 | TS 7 支持情况 | 原因 |
|---|---|---|---|---|
| **@typescript-eslint/typescript-estree** | 间接通过 typescript-eslint 8.62.0 | 8.62.0 (latest) | ❌ **不支持** | peerDep 限制 `>=4.8.4 <6.1.0`；源码中 10+ 个文件用 `require("typescript")` 调用编译器 API |
| **@typescript-eslint/parser** | 间接通过 typescript-eslint 8.62.0 | 8.62.0 (latest) | ❌ **不支持** | peerDep 同样限制 `<6.1.0` |
| **rollup-plugin-dts** | 间接通过 unplugin-dts | 6.4.1 (latest) | ❌ **不支持** | peerDep `^4.5 \| ^5.0 \| ^6.0`；ESM 构建用 `import ts from "typescript"`（默认导出） |
| **unplugin-dts** | 1.0.3 | 1.0.3 (latest) | ⚠️ **需额外安装 fallback** | 已内置 TS 7 检测逻辑，但需要你额外安装 `@typescript/typescript6` 包作为 fallback（见下方说明） |

### 🟡 中等：通过工具链间接依赖

| 包 | 状态 | 说明 |
|---|---|---|
| **cosmiconfig-typescript-loader** | ✅ 不受影响 | 使用 `jiti` 运行时加载 TS 文件，不直接 import typescript 包 |
| **@commitlint/load** | ⚠️ 有风险 | peerDep 限制 `typescript: "^6.0.0"`；内部通过 cosmiconfig-typescript-loader 间接使用，但如果 cosmiconfig 尝试解析 `.ts` 配置文件可能触发 TS 7 兼容问题 |
| **@vue/eslint-config-typescript** | ⚠️ 间接影响 | 本身不直接 import typescript，但依赖 `typescript-eslint` → `@typescript-eslint/typescript-estree`，会随上面一起挂掉 |

### ✅ 不受影响

| 包 | 说明 |
|---|---|
| **vite** | 不直接依赖 typescript |
| **vitest** | 不直接依赖 typescript |
| **@volar/typescript** | 是 typescript 的封装库，不直接 import typescript 包 |
| **vue** | 仅声明 peerDep `typescript: "*"`，不直接使用编译器 API |
| **@eslint-react/eslint-plugin** | peerDep `typescript: "*"`，不直接 import |
| **eslint-plugin-vue** | 使用 espree/acorn 解析，不依赖 typescript |

## 你需要采取的行动

### 1. 对于 `unplugin-dts`（你已安装最新版 1.0.3）

它已经内置了 TS 7 回退机制，但需要额外安装一个包：

```bash
pnpm add -D @typescript/typescript6
```

这个包提供 TS 6.x 的编译器 API 供 unplugin-dts 在检测到 TS 7 时使用。

### 2. 对于 `@typescript-eslint/*`（typescript-eslint 生态）

- 当前最新版 **8.62.0** 和 canary **8.62.1-alpha.0** 都**不支持** TS 7（peerDep 仍然限制 `<6.1.0`）
- GitHub 上有 61 个关于 "typescript 7" 的 issue，但**尚无修复版本**
- 建议：在 TS 7 正式版发布前，保持你的 `typescript` 锁定在 `^6.0.x`，不要升级到 rc

### 3. 对于 `rollup-plugin-dts`

- 最新版 **6.4.1** 仍使用 `import ts from "typescript"`，**不支持** TS 7
- 仓库暂无公开的 TS 7 适配 issue 或 PR
- 由于你的项目通过 `unplugin-dts` 间接使用它，而 unplugin-dts 有 `@typescript/typescript6` 回退，所以实际构建时它会使用 TS 6.x 版本的 rollup-plugin-dts

## 总结建议

| 优先级 | 操作 |
|---|---|
| **高** | 暂时不要将 `typescript` 升级到 `7.0.1-rc`，`@typescript-eslint` 生态尚未支持 |
| **中** | 如果必须测试 TS 7，安装 `@typescript/typescript6` 让 `unplugin-dts` 能正常工作 |
| **低** | 关注 `@typescript-eslint/typescript-estree` 的 canary 发布，一旦 peerDep 放宽到包含 TS 7 即可升级 |

目前你的项目 `typescript: "^6.0.3"` 是安全的，与所有依赖兼容。TS 7.0 的正式发布时间表尚未明确，生态适配还需要一段时间。
