# rolldown-plugin-css

Rolldown 的 CSS 编译插件。负责将 CSS / SCSS / Sass / Less 文件编译为标准 CSS，经由 LightningCSS 转换处理后，按 chunk 输出为独立的 CSS asset 文件。

---

## 功能

- 自动识别并处理 `.css` / `.scss` / `.sass` / `.less` 文件
- 自动检测可用的 Sass 编译器（优先 `sass-embedded`，回退到 `sass`）
- 通过 LightningCSS 进行语法降级、自动 vendor prefix、CSS Nesting 展开
- 支持 CSS Modules（`*.module.*`），输出稳定的哈希类名
- 每个 JS chunk 对应一个 CSS 文件，输出路径统一归入指定子目录
- 不负责向 JS 注入 `import` 语句（由 `rolldown-plugin-css-inject` 负责）

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

默认配置下，所有 CSS 文件会输出到 `dist/css/` 目录：

```
dist/
  css/
    components.css          ← components entry 的样式
    components.Dzqt_Fdc.css ← 共享 chunk 的样式
  index.esm.js
  components.esm.js
  js/
    components.Dzqt_Fdc.js
```

---

## 配置项

### `targets`

类型：`Targets`（来自 `lightningcss`）  
默认值：`undefined`（不做语法降级）

LightningCSS 的浏览器编译目标，用于控制 CSS 语法降级的范围。建议配合 `browserslist` 使用。

```ts
import { browserslistToTargets } from 'lightningcss'
import browserslist from 'browserslist'

cssPlugin({
  targets: browserslistToTargets(browserslist('>= 0.5%, not dead')),
})
```

不设置则 LightningCSS 不做任何语法降级，只做转换（如 CSS Nesting 展开）。

---

### `include`

类型：`number`（LightningCSS `Features` bitmask）  
默认值：`Features.Nesting | Features.CustomMediaQueries`

控制 LightningCSS 需要转换/降级哪些 CSS 草案特性。值为 `Features` 枚举的按位或组合。

```ts
import { Features } from 'lightningcss'

cssPlugin({
  // 只展开 CSS Nesting
  include: Features.Nesting,
})

cssPlugin({
  // 展开 Nesting + 自定义媒体查询 + 颜色函数
  include: Features.Nesting | Features.CustomMediaQueries | Features.OklabColors,
})
```

`Features` 从本插件直接 re-export，无需单独引入：

```ts
import { cssPlugin, Features } from './scripts/rolldown-plugin-css'
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

CSS Modules 的类名生成规则。支持以下占位符：

| 占位符 | 含义 |
|--------|------|
| `[hash]` | 基于文件路径生成的短哈希 |
| `[local]` | 原始类名 |
| `[name]` | 文件名（不含扩展名） |

```ts
// 默认：a1b2c_button
cssPlugin({ cssModulesPattern: '[hash]_[local]' })

// 仅哈希：a1b2c
cssPlugin({ cssModulesPattern: '[hash]' })

// 文件名 + 类名：Button_button
cssPlugin({ cssModulesPattern: '[name]_[local]' })
```

**识别规则**：文件名包含 `.module.` 的文件会被当作 CSS Module 处理，例如 `Button.module.scss`、`card.module.css`。

---

### `cssDir`

类型：`string`  
默认值：`'css'`

CSS 文件输出到总输出目录（`output.dir`）下的相对子目录。

```ts
// 默认：dist/css/components.css
cssPlugin({ cssDir: 'css' })

// 自定义：dist/assets/styles/components.css
cssPlugin({ cssDir: 'assets/styles' })

// 直接输出到根目录：dist/components.css
cssPlugin({ cssDir: '' })
```

> **注意**：如果同时使用 `rolldown-plugin-css-inject`，两者的 `cssDir` 必须保持一致，否则注入的 import 路径会指向不存在的文件。

---

## CSS Modules 用法

文件名包含 `.module.` 即自动启用 CSS Modules：

```scss
// Button.module.scss
.button {
  color: red;

  &:hover {
    color: darkred;
  }
}

.icon {
  width: 16px;
}
```

```tsx
// Button.tsx
import styles from './Button.module.scss'

export function Button() {
  return (
    <button className={styles.button}>
      <span className={styles.icon} />
      Click
    </button>
  )
}
```

插件会将 CSS Module 文件转换为 JS 模块，导出类名映射：

```js
// 编译产物（示意）
const classes = {
  "button": "a1b2c_button",
  "icon":   "a1b2c_icon"
}
export default classes
```

对应的 CSS 内容（`.a1b2c_button { ... }`）会被提取并写入对应 chunk 的 CSS 文件。

---

## 输出规则

CSS 文件与 JS chunk **一一对应**，命名规则：

| chunk 类型 | JS 文件示例 | CSS 文件示例（cssDir='css'）|
|-----------|------------|--------------------------|
| entry chunk | `components.esm.js` | `css/components.css` |
| 非 entry chunk | `js/components.Dzqt_Fdc.js` | `css/components.Dzqt_Fdc.css` |

**关键**：插件只处理"这个 chunk 直接拥有的 CSS 模块"，不递归遍历依赖。Rolldown 在打包时会将 CSS stub 模块（CSS 文件经 transform 后产生的空 JS 占位）分配到与引用它的 JS 模块相同的 chunk，所以平铺检查 `chunk.moduleIds` 就能准确找到属于这个 chunk 的 CSS。

---

## 设计思路

### 为什么不用 PostCSS？

LightningCSS 是用 Rust 编写的，解析和转换速度比 PostCSS 快 100 倍以上，同时内置了 CSS Modules、语法降级、vendor prefix、minify 等所有常用功能，无需额外插件生态。

### 预编译器为什么自动检测而非手动配置？

手动配置意味着用户需要了解插件内部机制并多写一段样板代码。而预编译器的选择通常只取决于项目里安装了什么，让插件自动检测更符合"零配置"的使用习惯。检测结果会缓存在模块级变量中，整个构建过程只执行一次 `import` 尝试。

`sass-embedded` 优先于 `sass` 是因为前者使用原生 binary，在大型项目中编译速度有数量级的差距。

### transform hook 的职责

`transform` 是 Rolldown 构建阶段的 hook，每个模块被解析后都会经过这里。插件在这个阶段做三件事：

1. **预编译**：如果是 Sass/Less 文件，调用对应编译器生成标准 CSS，同时拿到 sourceMap。sourceMap 会作为 `inputSourceMap` 传给 LightningCSS，这样最终的 sourcemap 可以直接追溯到原始 `.scss` 源文件，而不是编译后的中间 CSS。

2. **LightningCSS 转换**：对标准 CSS 执行语法转换。CSS Module 文件传入 `cssModules` 选项，LightningCSS 会返回 `exports` 对象（原始类名 → 哈希类名的映射）。

3. **返回 JS 代码**：
   - CSS Module：返回包含类名映射的 JS 对象（`export default { button: 'a1b2c_button' }`），让 Rolldown 将它当成普通 JS 模块处理。
   - 普通 CSS：返回一个注释占位符（`/* css-plugin: filename */`），让 Rolldown 知道这个模块存在，同时不产生任何 JS 运行时代码。

两种情况都设置 `moduleSideEffects: true`，确保模块不会被 tree-shake 掉，在后续 `generateBundle` 阶段能通过 `chunk.moduleIds` 找到它。

### generateBundle hook 的职责

`generateBundle` 是 Rolldown 输出阶段的最后一个 hook，此时所有 chunk 的归属已经确定。插件在这里：

1. 遍历 bundle 中所有 chunk（包括非 entry chunk）
2. 对每个 chunk，平铺检查其 `moduleIds`，找出属于该 chunk 的 CSS 模块 id
3. 按 `moduleIds` 的顺序拼接 CSS 字符串（顺序 = import 顺序，保证样式覆盖关系正确）
4. 调用 `this.emitFile` 输出 CSS asset

**为什么用平铺检查而不是递归遍历模块图？**

递归遍历（DFS）会把所有传递依赖的 CSS 都收进来，导致同一段 CSS 可能出现在多个 chunk 的输出里（例如 `components.css` 和 `index.css` 都包含 carousel 的样式）。Rolldown 在打包时已经做了模块归属的决策——每个模块（包括 CSS stub）只归属于一个 chunk，直接读 `chunk.moduleIds` 就能得到准确的"这个 chunk 独有的 CSS"，不需要自己再做归属判断。

### CSS Module 的 CSS 去哪了？

CSS Module 文件经 `transform` 后，对 Rolldown 来说是一个普通 JS 模块（导出类名映射）。但它的 CSS 内容同样被存入了 `cssRecords`。`generateBundle` 阶段检查 `chunk.moduleIds` 时，CSS Module 的模块 id 也会出现在里面，对应的 CSS 会和普通 CSS 一起写入 chunk 的 CSS 文件。JS 端消费的是类名映射，CSS 端消费的是哈希后的样式规则，两者各走各的路。

### 为什么不在 transform 里直接 emitFile？

一个 CSS 文件可能在多个地方被 import，`transform` 会为同一个文件调用多次（或被缓存）。更重要的是，在 `transform` 阶段还不知道这个 CSS 模块最终会归属到哪个 JS chunk，无法确定 CSS 文件的命名和位置。只有在 `generateBundle` 阶段，chunk 归属才完全确定，这时 emit 才是准确的。

---

## 注意事项

**Sass 与 Less 不能混用在同一个文件里。** 插件按文件扩展名判断使用哪个预编译器，`.scss`/`.sass` 走 Sass，`.less` 走 Less，`.css` 直接进 LightningCSS。

**LightningCSS 不处理 `@import`。** 如果你的 CSS 文件里有 `@import`，LightningCSS 默认不会内联它们。Sass 和 Less 的 `@import`/`@use` 由各自的编译器处理，不受此限制。

**CSS asset 文件名不含路径前缀。** 非 entry chunk 的 CSS 文件名取自 `path.basename(chunk.fileName)`，即只保留文件名部分（如 `components.Dzqt_Fdc.css`），不保留原来的 `js/` 目录前缀，统一归入 `cssDir` 目录。

**`cssDir` 与 `rolldown-plugin-css-inject` 的 `cssDir` 必须一致。** 两个插件独立运行，通过相同的命名规则约定 CSS 文件位置。如果两边配置不一致，inject 插件注入的路径会指向不存在的文件。