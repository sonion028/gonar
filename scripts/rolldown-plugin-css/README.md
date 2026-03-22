# rolldown-plugin-css

Rolldown 的一体化 CSS 处理插件。在单个插件内完成 CSS 编译、转换、asset 输出和 import 语句注入的全部工作。

---

## 功能

- 自动识别并处理 `.css` / `.scss` / `.sass` / `.less` 文件
- 自动检测可用的 Sass 编译器（优先 `sass-embedded`，回退到 `sass`）
- 通过 LightningCSS 进行语法降级、自动 vendor prefix、CSS Nesting 展开、压缩
- 支持 CSS Modules（`*.module.*`），输出稳定的哈希类名
- 每个含有 CSS 的 JS chunk 对应输出一个 CSS 文件，统一归入指定子目录
- 在对应的 JS chunk 头部自动注入 `import './xxx.css'` 语句

---

## 安装

```bash
# 必装
npm add -D lightningcss

# Sass 支持（二选一，推荐 sass-embedded）
npm add -D sass-embedded
# 或
npm add -D sass

# Less 支持
npm add -D less
```

---

## 基础用法

```ts
// rolldown.config.ts
import { defineConfig } from 'rolldown'
import { cssPlugin } from './scripts/rolldown-plugin-css'

export default defineConfig({
  input: {
    index: 'src/index.ts',
    components: 'src/components/index.ts',
  },
  output: {
    dir: 'dist',
    format: 'esm',
  },
  plugins: [
    cssPlugin(),
  ],
})
```

默认配置下输出结构：

```
dist/
  css/
    components.css             ← components entry 的样式
    components.Dzqt_Fdc.css   ← 共享 chunk 的样式
  index.esm.js
  components.esm.js
  js/
    components.Dzqt_Fdc.js    ← 头部自动插入 import '../css/components.Dzqt_Fdc.css'
```

---

## 配置项

### `targets`

类型：`Targets`（来自 `lightningcss`）
默认值：`undefined`

LightningCSS 的浏览器编译目标，用于控制 CSS 语法降级范围。建议配合 `browserslist` 使用。

```ts
import { browserslistToTargets } from 'lightningcss'
import browserslist from 'browserslist'

cssPlugin({
  targets: browserslistToTargets(browserslist('>= 0.5%, not dead')),
})
```

不设置则不做任何语法降级，只做转换（如 CSS Nesting 展开）。

---

### `include`

类型：`number`（LightningCSS `Features` bitmask）
默认值：`Features.Nesting | Features.CustomMediaQueries`

控制 LightningCSS 需要转换哪些 CSS 草案特性。`Features` 从本插件直接 re-export：

```ts
import { cssPlugin, Features } from './scripts/rolldown-plugin-css'

cssPlugin({
  include: Features.Nesting | Features.CustomMediaQueries | Features.OklabColors,
})
```

---

### `minify`

类型：`boolean`
默认值：`false`

是否压缩输出的 CSS。压缩由 LightningCSS 完成，速度极快。

```ts
cssPlugin({
  minify: process.env.NODE_ENV === 'production',
})
```

---

### `cssModulesPattern`

类型：`string`
默认值：`'[hash]_[local]'`

CSS Modules 的类名生成规则。支持 `[hash]`、`[local]`、`[name]` 占位符。

```ts
cssPlugin({ cssModulesPattern: '[hash]_[local]' })  // → a1b2c_button（默认）
cssPlugin({ cssModulesPattern: '[name]_[local]' })  // → Button_button
cssPlugin({ cssModulesPattern: '[hash]' })           // → a1b2c
```

文件名包含 `.module.` 的文件自动启用 CSS Modules，如 `Button.module.scss`。

---

### `format`

类型：`'es' | 'cjs'`
默认值：`'es'`

注入的 import 语句格式，需与 `output.format` 保持一致。

```ts
cssPlugin({ format: 'es' })   // → import './css/components.css'（默认）
cssPlugin({ format: 'cjs' })  // → require('./css/components.css')
```

---

### `cssDir`

类型：`string`
默认值：`'css'`

CSS 文件输出到总输出目录（`output.dir`）下的相对子目录。注入的 import 路径会自动跟随计算。

```ts
cssPlugin({ cssDir: 'css' })            // → dist/css/components.css（默认）
cssPlugin({ cssDir: 'assets/styles' }) // → dist/assets/styles/components.css
cssPlugin({ cssDir: '' })              // → dist/components.css
```

---

## CSS Modules 用法

```scss
// Button.module.scss
.button {
  color: red;
  &:hover { color: darkred; }
}
```

```tsx
// Button.tsx
import styles from './Button.module.scss'

export function Button() {
  return <button className={styles.button}>Click</button>
}
```

插件将 CSS Module 文件转换为 JS 模块，导出类名映射：

```js
// 编译产物（示意）
const classes = { "button": "a1b2c_button" }
export default classes
```

对应的 CSS（`.a1b2c_button { ... }`）会被提取并写入该 chunk 的 CSS 文件。

---

## 设计思路

### 为什么把编译和注入集成在同一个插件里？

早期版本将 CSS 编译（`cssPlugin`）和 import 注入（`cssInjectPlugin`）拆成两个独立插件，原因是误以为 Rolldown 的 `generateBundle` 里 `chunk.code` 是只读的，必须用 `renderChunk` 的返回值才能修改 JS 输出。

实际验证后发现 `chunk.code` 在 `generateBundle` 里可以直接赋值。这让两件事可以在同一个 hook 里完成：emit CSS asset 时已经知道了 `cssFileName`，当前遍历的 `chunk` 就是需要注入的目标，不需要任何额外的查找或插件间通信。

```ts
// generateBundle 里的核心逻辑（简化）
this.emitFile({ type: 'asset', fileName: cssFileName, source: css })

const rel = path.relative(path.dirname(chunk.fileName), cssFileName)
chunk.code = `import '${rel}';\n` + chunk.code
```

拆成两个插件时需要通过约定命名规则让注入插件推算 CSS 文件位置，合并后完全不存在这个问题。

### transform hook 的职责

`transform` 把每个 CSS/预编译文件转换成 Rolldown 能处理的 JS 模块：

**普通 CSS** → 返回只有注释的空 JS 占位符：

```js
/* css-plugin: src/components/carousel/style.css */
```

这个占位符告诉 Rolldown "这个模块存在于模块图里"，使 Rolldown 将其分配到对应的 chunk。`generateBundle` 阶段通过 `Object.keys(chunk.modules)` 找到它，就知道这个 chunk 需要处理 CSS。`moduleSideEffects: true` 确保它不被 tree-shaker 移除。

**CSS Module** → 返回导出类名映射的真实 JS 模块：

```js
const classes = { "button": "a1b2c_button" }
export default classes
```

消费方 `import styles from './Button.module.scss'` 拿到的就是这个对象。CSS 内容同样被存入 `cssRecords`，在 `generateBundle` 阶段写入输出文件。

### generateBundle hook 的职责

对每个包含 CSS 的 chunk 依次执行三步：

1. 用 `Object.keys(chunk.modules)` 找出属于这个 chunk 的 CSS 模块 id
2. 拼接 CSS 内容，`this.emitFile` 输出 CSS asset
3. 计算从 JS chunk 目录到 CSS asset 的相对路径，prepend import 语句到 `chunk.code`

**为什么用 `chunk.modules` 而不是 `chunk.moduleIds`？**

`chunk.moduleIds` 是 tree-shake 后的存活模块列表，内容为注释的 CSS 占位符模块可能被过滤掉。`chunk.modules`（`Record<id, RenderedModule>`）包含所有实际渲染进 chunk 的模块，包括空内容模块，更可靠。

**为什么用平铺检查而不是递归遍历模块图？**

Rolldown 在 code splitting 时会把每个模块（包括 CSS 占位符）分配到唯一的一个 chunk。直接检查 `chunk.modules` 就能得到这个 chunk 独有的 CSS，不会产生跨 chunk 的重复收集。递归遍历反而会把传递依赖的 CSS 也收进来，导致多个 chunk 重复包含同一段样式。

### 预处理器为什么自动检测？

按文件扩展名判断预处理器，结果缓存在模块级变量中，整个构建过程只尝试 `import` 一次。`sass-embedded` 优先于 `sass` 是因为前者使用原生 binary，大型项目中速度有数量级差距。

### sourceMap 链路

Sass/Less 编译时开启 sourceMap，将其作为 `inputSourceMap` 传给 LightningCSS，最终的 sourcemap 可以直接追溯到原始 `.scss`/`.less` 源文件，而不是编译后的中间 CSS。

---

## 注意事项

**`format` 需与 `output.format` 一致。** 插件不自动感知 Rolldown 的输出格式，需手动配置。ESM 项目用默认值 `'es'` 即可，CJS 项目需显式设置 `format: 'cjs'`。

**不适用于 `iife` 或 `umd` 格式。** 这些格式的产物通常是自包含的单文件，建议直接在 HTML 里用 `<link>` 标签引入 CSS。

**CSS asset 文件名不含原始目录前缀。** 非 entry chunk 的 CSS 文件名取自 `path.basename(chunk.fileName, ext)`，只保留文件名部分，统一归入 `cssDir` 目录。例如 `js/components.Dzqt_Fdc.js` 对应 `css/components.Dzqt_Fdc.css`，而不是 `css/js/components.Dzqt_Fdc.css`。

**LightningCSS 不内联 `@import`。** 纯 CSS 文件里的 `@import` 不会被 LightningCSS 自动内联。Sass 的 `@use`/`@forward` 和 Less 的 `@import` 由各自编译器处理，不受此限制。