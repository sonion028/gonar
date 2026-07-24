# Oxlint 迁移规则功能缺口清单

本文用于记录当前项目从 ESLint 迁移到 Oxlint 后，仍需要关注的**功能级**检查缺口，方便未来 Oxlint 新增规则、插件能力或 Vue template 解析能力后按图补齐。

## 判定原则

- 只按“实际检查效果”判断缺失：Oxlint 规则名不同但能覆盖相同问题时，不计入生态功能缺失。
- 原 ESLint 配置里显式关闭的规则，不计入缺失。
- 纯格式化诉求优先交给 `oxfmt`，只有格式化器无法表达的语义检查才计入缺失。

## 本次分析基线

| 项 | 取值 |
| --- | --- |
| ESLint 配置 | `eslint.config.ts` |
| Oxlint 配置 | `.oxlintrc.json` |
| Oxlint 版本 | `1.75.0` |
| ESLint 临时分析环境 | `eslint@10.7.0`、`@eslint/js@10.0.1`、`typescript-eslint@8.65.0`、`eslint-plugin-jsdoc@63.2.1`、`eslint-plugin-vue@10.10.0`、`@eslint-react/eslint-plugin@5.18.0`、`eslint-plugin-react-refresh@0.5.3` |
| Oxlint 规则来源 | 在隔离目录完整复制 `.oxlintrc.json`，用真实 `oxlint --format json <probe-file>` 逐条探针验证；`oxlint --rules` 只用于确认规则是否存在和所属分类，不使用 `--print-config` 作为启用规则依据 |
| ESLint 规则来源 | 在隔离目录完整复制 `eslint.config.ts`，安装配置中引用的插件后，用 ESLint API `calculateConfigForFile` 读取真实合成配置，并用真实 `eslint --format json <probe-file>` 逐条探针验证 |

> 注意：仓库当前 `package.json` 已不包含 ESLint 依赖，因此 ESLint 规则清单来自隔离环境安装的同名包最新版。若未来需要复现历史某个时间点，请优先用当时 lockfile 中的 ESLint 依赖版本重跑。

### 本次逐条实测摘要

本次没有把 `oxlint --print-config` 的输出作为规则启用依据，因为它不会把 overrides 中的 `plugins` 与 `categories` 展开到最终 rules。实际做法是在 `/tmp/gonar-lint-verify` 中复制原始 `eslint.config.ts`、`.oxlintrc.json`、根 `tsconfig.json` 和匹配的 `packages/*/tsconfig.json`，安装缺失依赖，然后对每条需要判定的规则写独立 probe 文件并分别运行 ESLint/Oxlint。

已逐条实测的代表性规则如下：

| 类型 | 规则 | ESLint 实测 | Oxlint 实测 |
| --- | --- | --- | --- |
| JSDoc 缺失 | `jsdoc/check-param-names`、`jsdoc/check-values`、`jsdoc/require-jsdoc`、`jsdoc/reject-any-type`、`jsdoc/valid-types` | 均触发 | 当前配置未触发等价诊断 |
| JSDoc 已覆盖 | `jsdoc/implements-on-classes` | 触发 | 触发 `jsdoc(implements-on-classes)` |
| Vue template 缺失 | `vue/no-duplicate-attributes`、`vue/require-v-for-key`、`vue/no-use-v-if-with-v-for`、`vue/valid-v-model`、`vue/no-v-html` | 均触发 | 当前配置未触发等价诊断 |
| Vue 非 template 缺失 | `vue/no-mutating-props` | 触发 | 当前配置未触发等价诊断 |
| Vue 已覆盖 | `vue/no-async-in-computed-properties`、`vue/valid-define-props` | 均触发 | 分别触发 `vue(no-async-in-computed-properties)`、`vue(valid-define-props)` |
| React 已覆盖 | `react-refresh/only-export-components`、`@eslint-react/exhaustive-deps`、`@eslint-react/no-missing-key`、`@eslint-react/dom-no-dangerously-set-innerhtml` | 均触发 | 分别触发 `react(only-export-components)`、`react-hooks(exhaustive-deps)`、`react(jsx-key)`、`react(no-danger)` |
| React 缺失 | `@eslint-react/immutability`、`@eslint-react/refs`、`@eslint-react/globals`、`@eslint-react/no-create-ref`、`@eslint-react/dom-no-flush-sync`、`@eslint-react/web-api-no-leaked-interval` | 均触发 | 当前配置未触发等价诊断；其中 `immutability` / `refs` / `globals` probe 会触发较宽的 `react(react-compiler)`，但诊断语义不等价 |

## 配置结论概览

| 范围 | ESLint 原配置实际启用 | 当前 Oxlint 配置覆盖结论 |
| --- | --- | --- |
| JS / TS 推荐规则 | `@eslint/js` recommended + `typescript-eslint` recommended + 少量手动覆盖 | 大部分已由 Oxlint `eslint` / `typescript` / `oxc` / `unicorn` correctness 或显式 rules 覆盖。 |
| JSDoc | `jsdoc.configs['flat/recommended']`，且关闭了 4 条返回/类型相关规则 | 当前 Oxlint 已覆盖一部分 JSDoc correctness 与显式开启规则，但仍缺少若干高级 JSDoc 类型、标签值、排版和完整性检查。 |
| React Refresh | `react-refresh/only-export-components` | 当前 `react/only-export-components` 已显式启用，功能可覆盖 Fast Refresh 导出限制。 |
| `@eslint-react` recommended-typescript | React package 内启用约 67 条 `@eslint-react/*` 规则，另手动开启 `immutability` / `refs` / `globals` / `dom-no-unsafe-target-blank` / `exhaustive-deps` | React Hooks、key、danger、生命周期、DOM 安全等一批规则已有 Oxlint React 等价覆盖；React Compiler/纯度/泄漏清理/若干命名与 RSC 规则仍缺失。 |
| Vue recommended | `eslint-plugin-vue` recommended；`.vue` 额外配置 `vue-eslint-parser` 内部 TS parser | 当前 Oxlint Vue 插件覆盖部分 `<script>` / `<script setup>` 语义规则和少量显式规则；多数 template 规则仍缺失，根因是需要 Vue SFC/template parser 语义支持。 |
| JSX a11y / Promise / Import | ESLint 原配置没有这些插件 | 当前 Oxlint 配置启用了这些插件 correctness 规则，属于新增检查能力，不是迁移缺口。 |

## 当前 Oxlint 配置已覆盖的新增/替代能力

### Oxlint correctness 启用范围

当前 `.oxlintrc.json` 通过 `categories.correctness = error`，配合 root/overrides 中的插件，实际可覆盖下列 correctness 规则集合：

| Source | correctness 规则数 | 说明 |
| --- | ---: | --- |
| `eslint` | 57 | ESLint core correctness。 |
| `typescript` | 27 | TypeScript correctness；含 `no-floating-promises`、`await-thenable` 等类型感知规则。 |
| `oxc` | 13 | Oxc 独有 correctness。 |
| `unicorn` | 13 | Unicorn correctness。 |
| `jsdoc` | 9 | JSDoc correctness。 |
| `promise` | 3 | Promise correctness；ESLint 原配置未覆盖。 |
| `import` | 2 | `import/default`、`import/namespace`；ESLint 原配置未覆盖。 |
| `jsx-a11y` | 35 | JSX 无障碍 correctness；ESLint 原配置未覆盖。 |
| `react` | 19 | React correctness。 |
| `vue` | 31 | Vue correctness，主要覆盖 `<script>` / 组件选项相关规则。 |

### 不计入缺失的功能映射

| ESLint 规则/功能 | 当前 Oxlint 覆盖 | 说明 |
| --- | --- | --- |
| `react-refresh/only-export-components` | `react/only-export-components` | 功能等价：限制模块导出以兼容 React Fast Refresh；当前 React override 已显式启用。 |
| `@typescript-eslint/no-unused-vars` | `no-unused-vars` | Oxlint 的 `eslint/no-unused-vars` 对 TS/JS 文件生效；当前 correctness 已启用。 |
| `@typescript-eslint/no-array-constructor` | `no-array-constructor` | 当前显式启用。 |
| `@typescript-eslint/no-empty-object-type` | `typescript/no-empty-object-type` | 当前显式启用。 |
| `@typescript-eslint/no-explicit-any` | `typescript/no-explicit-any` | 当前显式启用。 |
| `@typescript-eslint/no-namespace` | `typescript/no-namespace` | 当前显式启用。 |
| `@typescript-eslint/no-require-imports` | `typescript/no-require-imports` | 当前显式启用。 |
| `@typescript-eslint/no-unsafe-function-type` | `typescript/no-unsafe-function-type` | 当前显式启用。 |
| `@typescript-eslint/no-unnecessary-type-constraint` | `typescript/no-unnecessary-type-constraint` | 当前显式启用。 |
| `@typescript-eslint/ban-ts-comment` | `typescript/ban-ts-comment` | 当前显式启用。 |
| `@typescript-eslint/no-duplicate-enum-values` | `typescript/no-duplicate-enum-values` | 当前 correctness 已启用。 |
| `@typescript-eslint/no-extra-non-null-assertion` | `typescript/no-extra-non-null-assertion` | 当前 correctness 已启用。 |
| `@typescript-eslint/no-misused-new` | `typescript/no-misused-new` | 当前 correctness 已启用。 |
| `@typescript-eslint/no-non-null-asserted-optional-chain` | `typescript/no-non-null-asserted-optional-chain` | 当前 correctness 已启用。 |
| `@typescript-eslint/no-this-alias` | `typescript/no-this-alias` | 当前 correctness 已启用。 |
| `@typescript-eslint/no-unsafe-declaration-merging` | `typescript/no-unsafe-declaration-merging` | 当前 correctness 已启用。 |
| `@typescript-eslint/no-wrapper-object-types` | `typescript/no-wrapper-object-types` | 当前 correctness 已启用。 |
| `@typescript-eslint/prefer-as-const` | `typescript/prefer-as-const` | 当前 correctness 已启用。 |
| `@typescript-eslint/prefer-namespace-keyword` | `typescript/prefer-namespace-keyword` | 当前 correctness 已启用。 |
| `@typescript-eslint/triple-slash-reference` | `typescript/triple-slash-reference` | 当前 correctness 已启用。 |
| `no-dupe-args` | 解析层/严格模式 | 现代模块/严格模式中已由解析或运行语义覆盖，不作为 lint 功能缺口。 |
| `no-octal` | 解析层/严格模式 | 八进制字面量问题由现代语法解析和严格模式覆盖，不作为 lint 功能缺口。 |
| Vue HTML 缩进、引号、换行、空格等格式规则 | `oxfmt` | 纯格式诉求不作为 lint 缺口；如需保留 lint 级别诊断，应另行评估。 |
| `jsdoc/no-undefined-types` | 原 ESLint 配置已关闭 | 不计入缺失。 |
| `jsdoc/require-returns` | 原 ESLint 配置已关闭 | 不计入缺失。 |
| `jsdoc/require-returns-type` | 原 ESLint 配置已关闭 | 不计入缺失；Oxlint 也显式 allow。 |
| `jsdoc/require-param-type` | 原 ESLint 配置已关闭 | 不计入缺失；Oxlint 也显式 allow。 |
| `@eslint-react/no-clone-element` | 原 ESLint 配置已关闭 | 不计入缺失。 |
| `@eslint-react/naming-convention-ref-name` | 原 ESLint 配置已关闭 | 不计入缺失。 |

## JSDoc 功能缺失

当前 Oxlint 已覆盖的 JSDoc 迁移项包括：`check-access`、`empty-tags`、`implements-on-classes`、`check-property-names`、`check-tag-names`、`no-defaults`、`require-param`、`require-param-description`、`require-param-name`、`require-property`、`require-property-description`、`require-property-name`、`require-property-type`、`require-returns-description`、`require-throws-type`、`require-yields`、`require-yields-type`。

仍缺失的功能如下：

| ESLint 原规则 | 功能说明 | Oxlint 当前覆盖 |
| --- | --- | --- |
| `jsdoc/check-alignment` | 检查 JSDoc 每行星号和缩进对齐。 | 未找到等价 lint 规则；格式化可能改善排版但不等价。 |
| `jsdoc/check-param-names` | 检查 `@param` 名称是否和函数真实参数一致。 | 未找到等价规则。 |
| `jsdoc/check-types` | 检查 JSDoc 类型写法是否合法、是否符合约定。 | 未找到等价规则。 |
| `jsdoc/check-values` | 检查部分标签值是否有效，例如 `@kind`、`@variation`。 | 未找到等价规则。 |
| `jsdoc/escape-inline-tags` | 检查内联标签中的特殊字符是否正确转义。 | 未找到等价规则。 |
| `jsdoc/multiline-blocks` | 要求多行 JSDoc 使用规范块注释格式。 | 未找到等价规则。 |
| `jsdoc/no-multi-asterisks` | 禁止 JSDoc 中出现多余或异常连续星号。 | 未找到等价规则。 |
| `jsdoc/reject-any-type` | 禁止在 JSDoc 类型里使用 `any`。 | 未找到等价 JSDoc 规则；TS 代码中的 `any` 由 `typescript/no-explicit-any` 覆盖。 |
| `jsdoc/reject-function-type` | 禁止在 JSDoc 类型里使用过宽泛的 `Function`。 | 未找到等价 JSDoc 规则；TS 类型中的 `Function` 由 `typescript/no-unsafe-function-type` 覆盖。 |
| `jsdoc/require-jsdoc` | 要求指定函数、类、方法等必须写 JSDoc。 | 未找到等价规则。 |
| `jsdoc/require-next-type` | 要求 `@next` 标签带类型信息。 | 未找到等价规则。 |
| `jsdoc/require-returns-check` | 检查有返回值的函数是否有匹配的 `@returns` 描述。 | 未找到等价规则。 |
| `jsdoc/require-yields-check` | 检查 generator 函数是否有匹配的 `@yields` 描述。 | 未找到等价规则。 |
| `jsdoc/tag-lines` | 控制 JSDoc 标签之间的空行规则。 | 未找到等价 lint 规则；格式化不完全等价。 |
| `jsdoc/ts-no-empty-object-type` | 禁止 JSDoc TypeScript 类型里使用容易误解的 `{}` 空对象类型。 | 未找到等价 JSDoc 规则；TS 代码中由 `typescript/no-empty-object-type` 覆盖。 |
| `jsdoc/valid-types` | 检查 JSDoc 类型表达式是否能被正确解析。 | 未找到等价规则。 |

## Vue 功能缺失

### 需要 Vue parser / template AST 才能完整支持的规则

当前 Oxlint Vue 插件已覆盖一批组件选项和 `<script setup>` 相关 correctness 规则，例如 `vue/no-async-in-computed-properties`、`vue/no-expose-after-await`、`vue/no-lifecycle-after-await`、`vue/valid-define-props`、`vue/valid-define-emits` 等；并且当前配置显式启用了 `vue/no-multiple-slot-args`、`vue/component-definition-name-casing`、`vue/prop-name-casing`、`vue/require-default-prop`、`vue/require-prop-types`、`vue/no-required-prop-with-default`。

但 ESLint 侧的 `eslint-plugin-vue` 依赖 `vue-eslint-parser` 获取 SFC/template AST。以下规则的核心信息来自 `<template>` 或 SFC 块结构，当前 Oxlint 没有等价 template parser 语义覆盖：

| ESLint 原规则 | 功能说明 | Oxlint 当前覆盖 |
| --- | --- | --- |
| `vue/no-child-content` | 禁止在不应有子内容的元素或指令中写子内容。 | 缺失；需要 template AST。 |
| `vue/no-deprecated-filter` | 禁止 Vue 3 已废弃的 filter 语法。 | 缺失；需要 template AST。 |
| `vue/no-deprecated-functional-template` | 禁止 Vue 3 已废弃的 functional template 写法。 | 缺失；需要 template AST。 |
| `vue/no-deprecated-html-element-is` | 禁止已废弃的 HTML 元素 `is` 用法。 | 缺失；需要 template AST。 |
| `vue/no-deprecated-inline-template` | 禁止 Vue 3 已废弃的 `inline-template`。 | 缺失；需要 template AST。 |
| `vue/no-deprecated-router-link-tag-prop` | 禁止 Vue Router 中已废弃的 `tag` prop。 | 缺失；需要 template AST。 |
| `vue/no-deprecated-scope-attribute` | 禁止已废弃的 `scope` attribute。 | 缺失；需要 template AST。 |
| `vue/no-deprecated-slot-attribute` | 禁止已废弃的 `slot` attribute。 | 缺失；需要 template AST。 |
| `vue/no-deprecated-slot-scope-attribute` | 禁止已废弃的 `slot-scope` attribute。 | 缺失；需要 template AST。 |
| `vue/no-deprecated-v-bind-sync` | 禁止 Vue 3 已废弃的 `.sync` 修饰符。 | 缺失；需要 template AST。 |
| `vue/no-deprecated-v-is` | 禁止已废弃的 `v-is` 指令。 | 缺失；需要 template AST。 |
| `vue/no-deprecated-v-on-native-modifier` | 禁止 Vue 3 已废弃的 `.native` 事件修饰符。 | 缺失；需要 template AST。 |
| `vue/no-deprecated-v-on-number-modifiers` | 禁止事件处理中已废弃或无效的数字按键修饰符。 | 缺失；需要 template AST。 |
| `vue/no-dupe-v-else-if` | 禁止重复的 `v-else-if` 条件分支。 | 缺失；需要 template AST。 |
| `vue/no-duplicate-attributes` | 禁止同一元素上出现重复属性。 | 缺失；需要 template AST。 |
| `vue/no-parsing-error` | 检查 template 解析错误。 | 缺失；需要 template parser。 |
| `vue/no-template-key` | 禁止在 `<template>` 上使用不合适的 `key`。 | 缺失；需要 template AST。 |
| `vue/no-textarea-mustache` | 禁止在 `<textarea>` 内容中使用 mustache 插值。 | 缺失；需要 template AST。 |
| `vue/no-unused-components` | 检查注册但未在 template 中使用的组件。 | 缺失；需要 script 与 template 关联分析。 |
| `vue/no-unused-vars` | 检查 template 作用域里未使用的变量。 | 缺失；普通 script 变量仍由 `no-unused-vars` 覆盖。 |
| `vue/no-use-v-if-with-v-for` | 禁止同一元素同时使用 `v-if` 和 `v-for`。 | 缺失；需要 template AST。 |
| `vue/no-useless-template-attributes` | 禁止 `<template>` 上无意义属性。 | 缺失；需要 template AST。 |
| `vue/no-v-text-v-html-on-component` | 禁止在组件上使用 `v-text` / `v-html`。 | 缺失；需要 template AST。 |
| `vue/require-component-is` | 要求动态组件使用合法 `is` 绑定。 | 缺失；需要 template AST。 |
| `vue/require-toggle-inside-transition` | 要求 `<transition>` 内部有可切换显示的元素。 | 缺失；需要 template AST。 |
| `vue/require-v-for-key` | 要求 `v-for` 列表项提供 `key`。 | 缺失；需要 template AST。 |
| `vue/use-v-on-exact` | 建议使用 `.exact` 修饰符避免事件组合误触发。 | 缺失；需要 template AST。 |
| `vue/valid-attribute-name` | 检查 template 属性名是否合法。 | 缺失；需要 template AST。 |
| `vue/valid-template-root` | 检查 template 根节点是否合法。 | 缺失；需要 template parser。 |
| `vue/valid-v-bind` | 检查 `v-bind` 用法是否合法。 | 缺失；需要 template AST。 |
| `vue/valid-v-cloak` | 检查 `v-cloak` 用法是否合法。 | 缺失；需要 template AST。 |
| `vue/valid-v-else` / `vue/valid-v-else-if` | 检查条件分支指令是否合法。 | 缺失；需要 template AST。 |
| `vue/valid-v-for` | 检查 `v-for` 表达式是否合法。 | 缺失；需要 template AST。 |
| `vue/valid-v-html` | 检查 `v-html` 用法是否合法。 | 缺失；需要 template AST。 |
| `vue/valid-v-if` | 检查 `v-if` 用法是否合法。 | 缺失；需要 template AST。 |
| `vue/valid-v-is` | 检查 `v-is` 用法是否合法。 | 缺失；需要 template AST。 |
| `vue/valid-v-memo` | 检查 `v-memo` 用法是否合法。 | 缺失；需要 template AST。 |
| `vue/valid-v-model` | 检查 `v-model` 用法是否合法。 | 缺失；需要 template AST。 |
| `vue/valid-v-on` | 检查 `v-on` / `@` 事件绑定是否合法。 | 缺失；需要 template AST。 |
| `vue/valid-v-once` | 检查 `v-once` 用法是否合法。 | 缺失；需要 template AST。 |
| `vue/valid-v-pre` | 检查 `v-pre` 用法是否合法。 | 缺失；需要 template AST。 |
| `vue/valid-v-show` | 检查 `v-show` 用法是否合法。 | 缺失；需要 template AST。 |
| `vue/valid-v-slot` | 检查 `v-slot` 用法是否合法。 | 缺失；需要 template AST。 |
| `vue/valid-v-text` | 检查 `v-text` 用法是否合法。 | 缺失；需要 template AST。 |
| `vue/html-end-tags` | 检查 HTML 结束标签是否正确。 | 缺失；需要 template parser。 |
| `vue/no-template-shadow` | 禁止 template 作用域变量遮蔽外层变量。 | 缺失；需要 template 作用域分析。 |
| `vue/require-explicit-emits` | 要求组件显式声明 emits。 | 缺失；需要 template 事件与 script 关联分析。 |
| `vue/v-on-event-hyphenation` | 约束自定义事件命名连字符风格。 | 缺失；需要 template AST。 |
| `vue/attributes-order` | 约束 template 属性排序。 | 缺失；需要 template AST。 |
| `vue/block-order` | 约束 SFC 中 `<script>` / `<template>` / `<style>` 块顺序。 | 缺失；需要 SFC 块结构分析。 |
| `vue/no-lone-template` | 禁止不必要的单独 `<template>` 包裹。 | 缺失；需要 template AST。 |
| `vue/no-v-html` | 禁止使用有 XSS 风险的 `v-html`。 | 缺失；需要 template AST。 |
| `vue/this-in-template` | 约束 template 中是否允许使用 `this`。 | 缺失；需要 template AST。 |

### Vue 非 template / 组件语义缺失

以下规则不完全依赖 template，但当前 Oxlint 仍没有明确等价功能：

| ESLint 原规则 | 功能说明 | Oxlint 当前覆盖 |
| --- | --- | --- |
| `vue/multi-word-component-names` | 要求组件名使用多个单词，避免和原生 HTML 标签冲突。 | 未找到等价规则。 |
| `vue/no-deprecated-dollar-listeners-api` | 禁止 Vue 3 已废弃的 `$listeners` API。 | 未找到等价规则。 |
| `vue/no-deprecated-dollar-scopedslots-api` | 禁止 Vue 3 已废弃的 `$scopedSlots` API。 | 未找到等价规则。 |
| `vue/no-mutating-props` | 禁止直接修改 props，避免破坏单向数据流。 | 未找到等价规则。 |
| `vue/no-ref-as-operand` | 禁止把 `ref` 对象直接作为运算对象，避免忘记使用 `.value`。 | 未找到等价规则。 |
| `vue/no-use-computed-property-like-method` | 禁止像调用函数一样调用 computed 属性。 | 未找到等价规则。 |
| `vue/require-valid-default-prop` | 检查 prop 默认值是否符合 Vue 要求，例如对象/数组默认值应为工厂函数。 | 未找到等价规则。 |
| `vue/one-component-per-file` | 要求一个文件只定义一个组件。 | 未找到等价规则。 |
| `vue/order-in-components` | 要求组件选项按固定顺序排列。 | 未找到等价 lint 规则；如果只关注排序风格，未来可评估 formatter。 |

## React / `@eslint-react` 功能缺失

当前 Oxlint 已通过 correctness 或显式 rules 覆盖了：Hooks 依赖、Hooks 调用规则、列表 key、重复 props、未定义 JSX 组件、children prop、dangerouslySetInnerHTML with children、findDOMNode、ReactDOM.render 返回值、class state 直接修改、部分 setState 生命周期限制、不安全生命周期、void DOM children、`target="_blank"` rel 安全、Fast Refresh 导出限制、数组 index key、script URL、命名空间 JSX、嵌套不稳定组件、缺少 render 返回值等。

仍缺失或未找到明确等价功能如下：

| ESLint 原规则 | 功能说明 | Oxlint 当前覆盖 |
| --- | --- | --- |
| `@eslint-react/error-boundaries` | 检查错误边界组件写法是否安全、合理。 | 未找到明确等价规则。 |
| `@eslint-react/no-access-state-in-setstate` | 禁止在 `setState` 中直接读取不安全的 `this.state`。 | 未找到明确等价规则。 |
| `@eslint-react/no-context-provider` | 限制或禁止特定 Context Provider 写法。 | 未找到明确等价规则。 |
| `@eslint-react/no-create-ref` | 禁止使用 `createRef`，倾向 callback ref 或 `useRef`。 | 未找到明确等价规则。 |
| `@eslint-react/no-forward-ref` | 限制使用 `forwardRef`。 | `react/forward-ref-uses-ref` 只检查 `forwardRef` 是否使用 ref 参数，不等价。 |
| `@eslint-react/no-nested-lazy-component-declarations` | 禁止在组件内部声明 `lazy` 组件。 | 未找到明确等价规则。 |
| `@eslint-react/no-unnecessary-use-prefix` | 检查不必要的 `use` 前缀命名。 | 未找到明确等价规则。 |
| `@eslint-react/no-unused-class-component-members` | 检查 class component 中未使用成员。 | 未找到明确等价规则。 |
| `@eslint-react/no-use-context` | 限制直接使用 `useContext`。 | 未找到明确等价规则。 |
| `@eslint-react/purity` | 检查组件/Hook 是否保持渲染纯净。 | `react/react-compiler` 可能覆盖一部分编译器约束，但不等价。 |
| `@eslint-react/set-state-in-effect` | 检查 effect 中不合理的 setState。 | 未找到明确等价规则。 |
| `@eslint-react/set-state-in-render` | 禁止渲染期间 setState。 | 未找到明确等价规则。 |
| `@eslint-react/static-components` | 要求组件定义保持静态，避免每次渲染创建新组件。 | `react/no-unstable-nested-components` 只覆盖部分嵌套组件场景。 |
| `@eslint-react/unsupported-syntax` | 检查 React Compiler 不支持的语法。 | `react/react-compiler` 可能覆盖一部分编译器诊断，但不等价。 |
| `@eslint-react/use-memo` | 检查 memoization 相关约定。 | 未找到明确等价规则。 |
| `@eslint-react/jsx-no-children-prop-with-children` | 禁止同时传 `children` prop 和 JSX children。 | `react/no-children-prop` 只覆盖 children prop，不覆盖“双重 children”精确语义。 |
| `@eslint-react/jsx-no-key-after-spread` | 禁止把 `key` 放在 spread props 后面导致覆盖顺序问题。 | 未找到明确等价规则。 |
| `@eslint-react/jsx-no-leaked-dollar` | 禁止 JSX 中泄漏 `$` 字符。 | 未找到明确等价规则。 |
| `@eslint-react/jsx-no-leaked-semicolon` | 禁止 JSX 中泄漏分号文本。 | 未找到明确等价规则。 |
| `@eslint-react/rsc-function-definition` | 检查 React Server Components 函数组件定义方式。 | 未找到明确等价规则。 |
| `@eslint-react/dom-no-flush-sync` | 禁止使用可能影响并发渲染的 `flushSync`。 | 未找到明确等价规则。 |
| `@eslint-react/dom-no-hydrate` | 禁止使用旧的 `hydrate` API。 | 未找到明确等价规则。 |
| `@eslint-react/dom-no-render` | 禁止使用旧的 `render` API。 | `react/no-render-return-value` 只禁止依赖 render 返回值，不禁止调用旧 `render`。 |
| `@eslint-react/dom-no-use-form-state` | 禁止或限制特定 DOM/form state API 用法。 | 未找到明确等价规则。 |
| `@eslint-react/web-api-no-leaked-event-listener` | 检查事件监听是否正确清理，避免泄漏。 | 未找到明确等价规则。 |
| `@eslint-react/web-api-no-leaked-fetch` | 检查 fetch 是否在组件生命周期中正确取消或处理。 | 未找到明确等价规则。 |
| `@eslint-react/web-api-no-leaked-intersection-observer` | 检查 IntersectionObserver 是否清理。 | 未找到明确等价规则。 |
| `@eslint-react/web-api-no-leaked-interval` | 检查 interval 是否清理。 | 未找到明确等价规则。 |
| `@eslint-react/web-api-no-leaked-resize-observer` | 检查 ResizeObserver 是否清理。 | 未找到明确等价规则。 |
| `@eslint-react/web-api-no-leaked-timeout` | 检查 timeout 是否清理。 | 未找到明确等价规则。 |
| `@eslint-react/naming-convention-context-name` | 检查 Context 命名约定。 | 未找到明确等价规则。 |
| `@eslint-react/naming-convention-id-name` | 检查 ID 相关命名约定。 | 未找到明确等价规则。 |
| `@eslint-react/immutability` | 检查 React 代码中直接修改对象/数组等不可变性问题。 | 未找到明确等价规则；当前 ESLint 手动开启，迁移后缺失。 |
| `@eslint-react/refs` | 检查 ref 是否在渲染期间被不安全读写。 | 未找到明确等价规则；当前 ESLint 手动开启，迁移后缺失。 |
| `@eslint-react/globals` | 检查渲染期间修改全局变量等副作用。 | 未找到明确等价规则；当前 ESLint 手动开启，迁移后缺失。 |

## 未来补齐建议

1. **优先关注 Vue template parser 能力**：一旦 Oxlint 支持 Vue template AST，优先核对上文所有 `vue/valid-*`、`vue/no-deprecated-*`、`vue/no-unused-components`、`vue/require-v-for-key`、`vue/no-use-v-if-with-v-for` 等规则。
2. **定期重跑 `oxlint --rules`**：新版本 Oxlint 可能把现有 `nursery` 或未启用规则迁入稳定分类，也可能新增 `@eslint-react` / Vue / JSDoc 等价规则。
3. **把“可通过配置补齐”的规则和“生态缺失”分开处理**：前者只需修改 `.oxlintrc.json`，后者需要等待 Oxlint 支持或保留 ESLint 辅助检查。
4. **React Compiler 相关规则需要谨慎判定**：`react/react-compiler` 可以发现一部分编译器不支持/不安全写法，但不应简单等同于 `@eslint-react/purity`、`static-components`、`unsupported-syntax`、`use-memo` 等细分规则。
5. **JSDoc 类型检查与 TS 类型检查不是完全替代关系**：TS 源码里的类型问题可由 TS/Oxlint TypeScript 规则覆盖，但 JSDoc 注释中的类型表达式、标签值和文档完整性仍需 JSDoc 专用规则。
