# rolldown-plugin-css

一个为 **Rolldown** 打造的 CSS 处理插件，整合了：

- **可插拔预编译器**：传入你自己的 `sass` / `less` 实例，插件本身不绑定任何预编译器
- **LightningCSS** 转换（语法降级、自动 vendor prefix、CSS Nesting 展开等）
- **CSS Modules**（`*.module.css` / `*.module.scss` 等任意扩展名）
- **按 entry 输出**：每个 entry chunk 只包含自身模块图中用到的 CSS，输出为独立 `<entry-name>.css`

---

## 安装

```bash
# 必装
npm add -D lightningcss

# 按需安装预编译器
npm add -D sass      # 处理 .scss / .sass
npm add -D less      # 处理 .less
```

---

## 使用方式

### 基础（仅 CSS）

```js
// rolldown.config.js
import { defineConfig } from "rolldown";
import { cssPlugin } from "./src/index.ts";

export default defineConfig({
  input: { main: "src/main.ts", admin: "src/admin.ts" },
  output: { dir: "dist", format: "es" },
  plugins: [cssPlugin()],
});
```

输出：`dist/main.css`，`dist/admin.css`——各自只含本 entry 用到的 CSS。

---

### 配合 Sass

```js
import * as sass from "sass";
import path from "node:path";
import { cssPlugin } from "./src/index.ts";

const sassPreprocessor = {
  extensions: [".scss", ".sass"],
  async process(code, id) {
    const result = sass.compileString(code, {
      syntax: id.endsWith(".sass") ? "indented" : "scss",
      sourceMap: true,
      sourceMapIncludeSources: true,
      url: new URL(`file://${id}`),
      loadPaths: [path.dirname(id), "node_modules"],
    });
    return {
      css: result.css,
      map: result.sourceMap ? JSON.stringify(result.sourceMap) : undefined,
    };
  },
};

export default defineConfig({
  input: "src/main.ts",
  output: { dir: "dist" },
  plugins: [cssPlugin({ preprocessors: [sassPreprocessor] })],
});
```

---

### 配合 Less

```js
import less from "less";

const lessPreprocessor = {
  extensions: [".less"],
  async process(code, id) {
    const result = await less.render(code, {
      filename: id,
      sourceMap: {},
    });
    return { css: result.css, map: result.map };
  },
};

export default defineConfig({
  plugins: [cssPlugin({ preprocessors: [lessPreprocessor] })],
});
```

---

### Sass + Less 同时使用

```js
export default defineConfig({
  plugins: [
    cssPlugin({
      preprocessors: [sassPreprocessor, lessPreprocessor],
      targets: browserslistToTargets(browserslist(">= 0.5%, not dead")),
      minify: process.env.NODE_ENV === "production",
    }),
  ],
});
```

---

## 选项

| 选项                | 类型                             | 默认值             | 说明                         |
| ------------------- | -------------------------------- | ------------------ | ---------------------------- | ------------------- |
| `preprocessors`     | `Preprocessor[]`                 | `[]`               | 可插拔预编译器列表           |
| `targets`           | `Record<string, BrowserVersion>` | `undefined`        | LightningCSS 浏览器目标      |
| `include`           | `number`                         | `Features.Nesting  | Features.CustomMediaQueries` | 需要降级的 CSS 特性 |
| `minify`            | `boolean`                        | `false`            | 是否压缩 CSS                 |
| `cssModulesPattern` | `string`                         | `'[hash]_[local]'` | CSS Modules 类名模式         |

---

## Preprocessor 接口

```ts
interface Preprocessor {
  /** 处理的文件扩展名，例如 ['.scss', '.sass'] */
  extensions: string[];
  /** 将源码编译为纯 CSS，可返回 sourceMap 供 LightningCSS 合并 */
  process(
    code: string,
    id: string,
  ): Promise<PreprocessorResult> | PreprocessorResult;
}

interface PreprocessorResult {
  css: string; // 编译后的 CSS 字符串
  map?: string; // 可选的 source map JSON 字符串
}
```

---

## 处理流程

```
.scss / .sass  ──► preprocessors['.scss'].process()  ──► 标准 CSS + sourceMap
.less          ──► preprocessors['.less'].process()  ──► 标准 CSS + sourceMap
.css  ───────────────────────────────────────────────────► (跳过预编译)
                                                      ↓
                                      lightningcss.transform()
                                      ┌──────────────────────────┐
                                      │  语法降级 / vendor prefix │
                                      │  CSS Nesting 展开         │
                                      │  CSS Modules 哈希         │
                                      └──────────────────────────┘
                                                      │
                          ┌───────────────────────────┴──────────────┐
                     *.module.*                                  普通 CSS
                     返回 JS proxy                        存入 cssRecords Map
              { button: 'a1b2c_button' }                          │
                                                                  ▼
                                                       generateBundle 阶段
                                                  遍历所有 entry chunk，
                                                  用 chunk.moduleIds 交叉
                                                  cssRecords，按导入顺序拼接
                                                         ↓          ↓
                                                   main.css    admin.css
```

---

## 按 entry 输出说明

Rolldown 在 `generateBundle` 阶段为每个 chunk 提供 `moduleIds`，其中包含该 chunk 内所有模块（含传递依赖）的绝对路径。插件遍历所有 entry chunk，用 `moduleIds` 与 `cssRecords` 做交集，只将属于本 entry 的 CSS 写入对应的 `.css` 文件。

如果两个 entry 共享同一个 CSS 文件，该 CSS 会同时出现在两个输出文件中——与 JS chunk 拆包行为对称。如需去重，可通过 `manualChunks` 将共享模块提取为独立 chunk，其对应的 CSS 也会单独成为一个 chunk 的 `moduleIds`，届时可按需扩展本插件的 `generateBundle` 逻辑来处理非 entry chunk。
