# rolldown-plugin-css-inject

Rolldown 的 CSS import 注入插件。在 JS chunk 头部自动插入对应 CSS 文件的 `import` 语句，使打包产物能在运行时正确加载样式。

本插件与 `rolldown-plugin-css` **完全独立**，不共享任何运行时状态，可以单独使用，也可以与其他 CSS 处理插件配合。

---

## 功能

- 自动检测每个 JS chunk 是否直接包含 CSS 模块
- 仅向确实需要样式的 chunk 注入语句，不污染其他文件
- 根据 chunk 的实际输出路径计算相对 import 路径，位置变化自动跟随
- 支持 ESM（`import`）和 CJS（`require`）两种输出格式
- 零依赖，无需配置外部状态或共享 Map

---

## 安装

本插件无额外 npm 依赖，直接使用即可（需要 `rolldown` 作为 peer dependency）。

---

## 基础用法

```ts
// rolldown.config.ts
import { defineConfig } from 'rolldown'
import { cssPlugin } from './scripts/rolldown-plugin-css'
import { cssInjectPlugin } from './scripts/rolldown-plugin-css-inject'

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
    cssInjectPlugin(),
  ],
})
```

打包后，包含 CSS 模块的 JS chunk 头部会自动插入：

```js
// dist/js/components.Dzqt_Fdc.js（示例）
import '../css/components.Dzqt_Fdc.css';

// ...原有 JS 代码
```

---

## 配置项

### `cssDir`

类型：`string`  
默认值：`'css'`

CSS 文件所在的相对子目录。本插件通过这个值推算 CSS 文件的路径，**必须与 `rolldown-plugin-css` 的 `cssDir` 保持一致**。

```ts
// cssPlugin 和 cssInjectPlugin 的 cssDir 必须相同
cssPlugin({ cssDir: 'assets/styles' })
cssInjectPlugin({ cssDir: 'assets/styles' })  // ← 同步修改

// 默认值相同，不修改时无需配置
cssPlugin()
cssInjectPlugin()
```

---

### `cssExtensions`

类型：`string[]`  
默认值：`['.css', '.scss', '.sass', '.less']`

用于识别"CSS 模块"的文件扩展名列表。插件通过检查 `chunk.moduleIds` 中是否存在这些扩展名的模块 id 来判断一个 chunk 是否包含 CSS。

需要与 `rolldown-plugin-css`（或你使用的其他 CSS 处理插件）实际处理的扩展名一致。如果你的项目只使用 Sass：

```ts
cssInjectPlugin({
  cssExtensions: ['.scss', '.sass'],
})
```

如果你添加了自定义扩展名（如 `.styl`）：

```ts
cssInjectPlugin({
  cssExtensions: ['.css', '.scss', '.sass', '.less', '.styl'],
})
```

---

### `format`

类型：`'es' | 'cjs'`  
默认值：`'es'`

注入语句的语法格式，应与 Rolldown `output.format` 保持一致。

```ts
// ESM 输出（默认）→ import './css/components.css'
cssInjectPlugin({ format: 'es' })

// CJS 输出 → require('./css/components.css')
cssInjectPlugin({ format: 'cjs' })
```

---

## 使用示例

### 多入口 + 自定义目录

```ts
plugins: [
  cssPlugin({ cssDir: 'assets', minify: true }),
  cssInjectPlugin({ cssDir: 'assets' }),
]
```

输出结构：
```
dist/
  assets/
    components.css
    components.Dzqt_Fdc.css
  components.esm.js      ← 无 import（本身不含 CSS 模块）
  js/
    components.Dzqt_Fdc.js  ← import '../assets/components.Dzqt_Fdc.css'
```

### CJS 格式

```ts
export default defineConfig({
  output: { format: 'cjs' },
  plugins: [
    cssPlugin(),
    cssInjectPlugin({ format: 'cjs' }),
  ],
})
```

注入结果：
```js
require('./css/components.css');
// ...
```

### 不使用 CSS 注入（库模式 / SSR）

直接不加 `cssInjectPlugin`，只用 `cssPlugin`：

```ts
plugins: [
  cssPlugin({ minify: true }),
  // 不加 cssInjectPlugin
]
```

CSS 文件会正常输出，但 JS 里不会有任何 import 语句。适合组件库（由消费方决定如何加载样式）或 SSR 场景。

---

## 设计思路

### 为什么与 cssPlugin 完全独立？

注入逻辑和 CSS 编译逻辑是两个完全不同的关注点：

- **CSS 编译**：读取源文件、运行预编译器、执行 LightningCSS 转换、输出 asset。这是构建阶段的工作，关心的是"CSS 内容是什么"。
- **import 注入**：在 JS 输出里插入一行语句。这是输出阶段的工作，关心的是"哪个 JS 文件需要加载哪个 CSS 文件"。

将两者解耦后，注入插件可以独立测试、独立替换，也可以在不需要注入的场景下直接去掉，而不影响 CSS 编译。

### 为什么用 renderChunk 而不是 generateBundle？

Rolldown 的 `OutputChunk.code` 在 `generateBundle` 阶段是**只读**的（通过 getter 实现，没有 setter），直接赋值虽然不报错，但 Rolldown 内部序列化时会忽略修改后的值，导致注入的语句不出现在产物里。这是 Rolldown 与 Rollup 的一个行为差异。

`renderChunk` 是专门用于修改 chunk 输出内容的 hook，通过**返回值**（`return { code, map }`）来告知 Rolldown 新的内容，这是官方支持的唯一正确方式。

### renderChunk 时 CSS asset 还没有 emit，路径怎么知道？

这是本插件最核心的设计决策。

CSS asset 由 `cssPlugin` 在 `generateBundle` 里 emit，而 `generateBundle` 在 `renderChunk` **之后**执行。这意味着 `renderChunk` 时无法通过 Rolldown API 查询到已 emit 的 CSS asset。

解决方案是：**两个插件约定 CSS 文件的命名规则，inject 插件按规则自行推算路径，不依赖运行时查询。**

命名规则非常简单：
- entry chunk → `{cssDir}/{chunk.name}.css`（如 `css/components.css`）
- 非 entry chunk → `{cssDir}/{path.basename(chunk.fileName).replace(/\.js$/, '.css')}`（如 `css/components.Dzqt_Fdc.css`）

这个规则在 `cssPlugin` 和 `cssInjectPlugin` 里各自硬编码，无需任何共享状态。只要两边保持 `cssDir` 一致，路径就一定对得上。

这是一种"约定优于配置"的设计：用简单的字符串规则替代复杂的运行时通信，让两个插件可以完全独立运行。

### 为什么用平铺检查而不是递归遍历？

早期版本使用 `this.getModuleInfo()` 递归遍历 entry chunk 的完整依赖图来收集 CSS，但这会导致**所有 entry chunk 都被注入**——因为 `index` entry 传递依赖了 `components`，`components` 又依赖了 carousel，所以 `index` 的依赖图里包含了 carousel 的 CSS，`index.esm.js` 就被注入了本不属于它的样式文件。

正确的做法是只看"这个 chunk 直接拥有的模块"。Rolldown 在 code splitting 时会把每个模块（包括 CSS stub 模块）分配到唯一的一个 chunk，`chunk.moduleIds` 就是这个分配结果的直接体现。CSS stub 模块会被分配到引用它的 JS 模块所在的 chunk，所以平铺检查 `chunk.moduleIds` 就能精确找到"这个 chunk 直接负责的 CSS"，不会产生跨 chunk 的重复注入。

### 什么是 CSS stub 模块？

`cssPlugin` 的 `transform` hook 对普通 CSS 文件返回的是：

```js
/* css-plugin: src/components/carousel/index.module.scss */
```

这是一个只有注释的空 JS 模块，称为"CSS stub"。它存在的目的是告诉 Rolldown：这个文件存在于模块图里，不要丢弃它。Rolldown 会像处理普通 JS 模块一样决定它归属于哪个 chunk，inject 插件通过检查 chunk 里是否有这类模块 id 来判断是否需要注入。

`moduleSideEffects: true` 是让 stub 模块不被 tree-shake 掉的关键设置。如果设为 `false`，Rolldown 会认为这个模块没有副作用，在没有消费其导出值的情况下直接从模块图中移除，导致 `chunk.moduleIds` 里找不到它，inject 插件也就无从判断。

### 路径计算

注入的 import 路径使用**相对路径**，从 JS chunk 的输出目录到 CSS 文件。这样无论 `output.dir` 配置为什么，路径都能正确解析：

```
JS:  dist/js/components.Dzqt_Fdc.js  → jsDir = 'js'
CSS: dist/css/components.Dzqt_Fdc.css
相对路径: path.relative('js', 'css/components.Dzqt_Fdc.css') = '../css/components.Dzqt_Fdc.css'
注入: import '../css/components.Dzqt_Fdc.css'
```

Windows 下 `path.relative` 返回反斜杠路径，`slash()` 函数统一替换为正斜杠，确保 import 路径在所有平台有效。

---

## 注意事项

**`renderChunk` 时 CSS asset 尚未 emit。** 注入的 import 路径是根据命名约定推算的，而不是通过 Rolldown API 查询得到的。如果 `cssPlugin` 的 `cssDir` 与本插件的 `cssDir` 不一致，路径会指向不存在的文件，浏览器会报 404 但不会构建报错。

**插件顺序无严格要求，但建议 cssPlugin 在前。** 两个插件工作在不同的 hook（`generateBundle` 和 `renderChunk`），相互不依赖，顺序不影响正确性。但将 `cssPlugin` 放在前面更符合直觉上的依赖关系。

**不适用于 `output.format: 'iife'` 或 `'umd'`。** 这些格式的产物通常是自包含的单文件，不使用 `import`/`require` 加载外部 CSS。如需在这些格式下加载样式，建议直接在 HTML 里用 `<link>` 标签引入。

**不会去重。** 如果同一个 chunk 通过多条路径引入了同一个 CSS 文件（理论上不常见，因为模块图会去重），CSS 内容在 `cssPlugin` 的 `cssRecords` Map 里只存一份，不会重复。但如果两个不同 CSS 文件被同一 chunk 引用，会生成两条 import 语句——这是正确行为。实际上每个 chunk 只会有一条 import（因为 `cssPlugin` 把同一 chunk 的所有 CSS 合并成了一个文件）。