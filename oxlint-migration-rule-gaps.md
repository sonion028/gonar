# Oxlint 迁移规则功能缺口清单

本文按“功能是否仍被覆盖”统计 ESLint → Oxlint 迁移后的规则缺口：

- 如果 Oxlint 已有不同名称但功能等价的规则，则不计入“功能缺失”。
- 如果原规则在迁移前已经显式关闭，则不计入“功能缺失”。
- 如果功能主要由格式化器 `oxfmt` 接管，则不计入“功能缺失”，但会在下方单独说明。
- 当前项目的 Oxlint 配置位于 `.oxlintrc.json`。

## 结论概览

| 类型 | 结论 |
| --- | --- |
| JS / TS 推荐规则 | 大部分已由 Oxlint core / `typescript` 插件覆盖。 |
| React Refresh | `react-refresh/only-export-components` 已由 `react/only-export-components` 覆盖。 |
| Vue `<script setup lang="ts">` | 可检查，Oxlint 能解析 `.vue` 的 `<script setup>` 中 JS/TS 代码。 |
| Vue Template 规则 | 多数仍缺失，主要因为 Oxlint 当前不支持 Vue template parsing。 |
| JSDoc | 部分高级 JSDoc 校验缺失。 |
| `@eslint-react` | 部分功能已有 Oxlint React 等价规则，但当前配置未全部启用；仍有一批 React 编译器/生命周期/Hook 细粒度规则缺失。 |
| CLI glob | Oxlint 配置文件里的 `files` 支持 glob；Oxlint CLI 位置参数不支持像 `oxfmt` 那样直接消费被引号包住的 brace glob。 |

## 不计入缺失的迁移项

| 迁移前规则/功能 | 迁移后覆盖 | 说明 |
| --- | --- | --- |
| `react-refresh/only-export-components` | `react/only-export-components` | 功能等价：限制模块导出以兼容 React Fast Refresh。 |
| `no-dupe-args` | 严格模式 / 解析层面覆盖 | 重复函数参数在现代模块/严格模式中已由语言层处理。 |
| `no-octal` | 严格模式 / 解析层面覆盖 | 八进制字面量问题由现代语法解析和严格模式覆盖。 |
| Vue HTML 缩进、空格、引号等纯格式规则 | `oxfmt` | 格式统一由 formatter 接管，不再作为 lint 规则统计。 |
| `jsdoc/no-undefined-types` | 原 ESLint 配置已关闭 | 迁移前就不是有效检查。 |
| `jsdoc/require-returns` | 原 ESLint 配置已关闭 | 迁移前就不是有效检查。 |
| `jsdoc/require-returns-type` | 原 ESLint 配置已关闭 | 迁移前就不是有效检查。 |
| `jsdoc/require-param-type` | 原 ESLint 配置已关闭 | 迁移前就不是有效检查。 |
| `@eslint-react/no-clone-element` | 原 ESLint 配置已关闭 | 迁移前就不是有效检查；Oxlint 也有 `react/no-clone-element` 可选规则。 |
| `@eslint-react/naming-convention-ref-name` | 原 ESLint 配置已关闭 | 迁移前就不是有效检查。 |

## JSDoc 功能缺失

| 迁移前规则 | 功能说明 | Oxlint 等价覆盖 |
| --- | --- | --- |
| `jsdoc/check-alignment` | 检查 JSDoc 注释中每一行星号和缩进是否对齐。 | 未找到等价 lint 规则；格式化可能部分改善排版，但不等价。 |
| `jsdoc/check-param-names` | 检查 `@param` 名称是否和函数真实参数一致。 | 未找到等价规则。 |
| `jsdoc/check-types` | 检查 JSDoc 类型写法是否合法、是否符合约定。 | 未找到等价规则。 |
| `jsdoc/check-values` | 检查部分标签值是否有效，例如 `@kind`、`@variation` 等。 | 未找到等价规则。 |
| `jsdoc/escape-inline-tags` | 检查内联标签中的特殊字符是否正确转义。 | 未找到等价规则。 |
| `jsdoc/multiline-blocks` | 要求多行 JSDoc 使用规范的块注释格式。 | 未找到等价规则。 |
| `jsdoc/no-multi-asterisks` | 禁止 JSDoc 中出现多余或异常的连续星号。 | 未找到等价规则。 |
| `jsdoc/reject-any-type` | 禁止在 JSDoc 类型里使用 `any`。 | 未找到等价 JSDoc 规则；TS 代码中的 `any` 仍由 `typescript/no-explicit-any` 覆盖。 |
| `jsdoc/reject-function-type` | 禁止在 JSDoc 类型里使用过宽泛的 `Function` 类型。 | 未找到等价 JSDoc 规则；TS 类型中的 `Function` 由 `typescript/no-unsafe-function-type` 覆盖。 |
| `jsdoc/require-jsdoc` | 要求指定函数、类、方法等必须写 JSDoc。 | 未找到等价规则。 |
| `jsdoc/require-next-type` | 要求 `@next` 标签带类型信息。 | 未找到等价规则。 |
| `jsdoc/require-returns-check` | 检查有返回值的函数是否有匹配的 `@returns` 描述。 | 未找到等价规则。 |
| `jsdoc/require-yields-check` | 检查 generator 函数是否有匹配的 `@yields` 描述。 | 未找到等价规则。 |
| `jsdoc/tag-lines` | 控制 JSDoc 标签之间的空行规则。 | 未找到等价 lint 规则；格式化不完全等价。 |
| `jsdoc/ts-no-empty-object-type` | 禁止 JSDoc TypeScript 类型里使用容易误解的 `{}` 空对象类型。 | 未找到等价 JSDoc 规则；TS 代码中由 `typescript/no-empty-object-type` 覆盖。 |
| `jsdoc/valid-types` | 检查 JSDoc 类型表达式是否能被正确解析。 | 未找到等价规则。 |

## Vue 功能缺失

### Vue 非 template / 组件语义规则缺失

| 迁移前规则 | 功能说明 | Oxlint 等价覆盖 |
| --- | --- | --- |
| `vue/multi-word-component-names` | 要求组件名使用多个单词，避免和原生 HTML 标签冲突。 | 未找到等价规则。 |
| `vue/no-deprecated-dollar-listeners-api` | 禁止使用 Vue 3 已废弃的 `$listeners` API。 | 未找到等价规则。 |
| `vue/no-deprecated-dollar-scopedslots-api` | 禁止使用 Vue 3 已废弃的 `$scopedSlots` API。 | 未找到等价规则。 |
| `vue/no-mutating-props` | 禁止直接修改 props，避免破坏单向数据流。 | 未找到等价规则。 |
| `vue/no-ref-as-operand` | 禁止把 `ref` 对象直接作为运算对象，避免忘记使用 `.value`。 | 未找到等价规则。 |
| `vue/no-use-computed-property-like-method` | 禁止像调用函数一样调用 computed 属性。 | 未找到等价规则。 |
| `vue/require-valid-default-prop` | 检查 prop 默认值是否符合 Vue 要求，例如对象/数组默认值应为工厂函数。 | 未找到等价规则。 |
| `vue/one-component-per-file` | 要求一个文件只定义一个组件。 | 未找到等价规则。 |
| `vue/order-in-components` | 要求组件选项按固定顺序排列，提升可读性。 | 未找到等价规则。 |

### Vue template parsing 相关规则缺失

| 迁移前规则 | 功能说明 | Oxlint 等价覆盖 |
| --- | --- | --- |
| `vue/no-child-content` | 禁止在不应有子内容的元素或指令中写子内容。 | 缺失；需要 Vue template parsing。 |
| `vue/no-deprecated-filter` | 禁止使用 Vue 3 已废弃的 filter 语法。 | 缺失；需要 Vue template parsing。 |
| `vue/no-deprecated-functional-template` | 禁止 Vue 3 已废弃的 functional template 写法。 | 缺失；需要 Vue template parsing。 |
| `vue/no-deprecated-html-element-is` | 禁止已废弃的 HTML 元素 `is` 用法。 | 缺失；需要 Vue template parsing。 |
| `vue/no-deprecated-inline-template` | 禁止 Vue 3 已废弃的 `inline-template`。 | 缺失；需要 Vue template parsing。 |
| `vue/no-deprecated-router-link-tag-prop` | 禁止 Vue Router 中已废弃的 `tag` prop。 | 缺失；需要 Vue template parsing。 |
| `vue/no-deprecated-scope-attribute` | 禁止已废弃的 `scope` attribute。 | 缺失；需要 Vue template parsing。 |
| `vue/no-deprecated-slot-attribute` | 禁止已废弃的 `slot` attribute。 | 缺失；需要 Vue template parsing。 |
| `vue/no-deprecated-slot-scope-attribute` | 禁止已废弃的 `slot-scope` attribute。 | 缺失；需要 Vue template parsing。 |
| `vue/no-deprecated-v-bind-sync` | 禁止 Vue 3 已废弃的 `.sync` 修饰符。 | 缺失；需要 Vue template parsing。 |
| `vue/no-deprecated-v-is` | 禁止已废弃的 `v-is` 指令。 | 缺失；需要 Vue template parsing。 |
| `vue/no-deprecated-v-on-native-modifier` | 禁止 Vue 3 已废弃的 `.native` 事件修饰符。 | 缺失；需要 Vue template parsing。 |
| `vue/no-deprecated-v-on-number-modifiers` | 禁止事件处理中已废弃或无效的数字按键修饰符。 | 缺失；需要 Vue template parsing。 |
| `vue/no-dupe-v-else-if` | 禁止重复的 `v-else-if` 条件分支。 | 缺失；需要 Vue template parsing。 |
| `vue/no-duplicate-attributes` | 禁止同一元素上出现重复属性。 | 缺失；需要 Vue template parsing。 |
| `vue/no-parsing-error` | 检查 template 解析错误。 | 缺失；需要 Vue template parsing。 |
| `vue/no-template-key` | 禁止在 `<template>` 上使用不合适的 `key`。 | 缺失；需要 Vue template parsing。 |
| `vue/no-textarea-mustache` | 禁止在 `<textarea>` 内容中使用 mustache 插值。 | 缺失；需要 Vue template parsing。 |
| `vue/no-unused-components` | 检查注册但未在 template 中使用的组件。 | 缺失；需要 Vue template parsing。 |
| `vue/no-unused-vars` | 检查 template 作用域里未使用的变量。 | 缺失；需要 Vue template parsing；普通 script 变量仍由 `no-unused-vars` 覆盖。 |
| `vue/no-use-v-if-with-v-for` | 禁止同一元素同时使用 `v-if` 和 `v-for`。 | 缺失；需要 Vue template parsing。 |
| `vue/no-useless-template-attributes` | 禁止 `<template>` 上无意义的属性。 | 缺失；需要 Vue template parsing。 |
| `vue/no-v-text-v-html-on-component` | 禁止在组件上使用 `v-text` / `v-html`。 | 缺失；需要 Vue template parsing。 |
| `vue/require-component-is` | 要求动态组件使用合法的 `is` 绑定。 | 缺失；需要 Vue template parsing。 |
| `vue/require-toggle-inside-transition` | 要求 `<transition>` 内部有可切换显示的元素。 | 缺失；需要 Vue template parsing。 |
| `vue/require-v-for-key` | 要求 `v-for` 列表项提供 `key`。 | 缺失；需要 Vue template parsing。 |
| `vue/use-v-on-exact` | 建议使用 `.exact` 修饰符避免事件组合误触发。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-attribute-name` | 检查 template 属性名是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-template-root` | 检查 template 根节点是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-v-bind` | 检查 `v-bind` 用法是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-v-cloak` | 检查 `v-cloak` 用法是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-v-else-if` | 检查 `v-else-if` 用法是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-v-else` | 检查 `v-else` 用法是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-v-for` | 检查 `v-for` 表达式是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-v-html` | 检查 `v-html` 用法是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-v-if` | 检查 `v-if` 用法是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-v-is` | 检查 `v-is` 用法是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-v-memo` | 检查 `v-memo` 用法是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-v-model` | 检查 `v-model` 用法是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-v-on` | 检查 `v-on` / `@` 事件绑定是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-v-once` | 检查 `v-once` 用法是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-v-pre` | 检查 `v-pre` 用法是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-v-show` | 检查 `v-show` 用法是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-v-slot` | 检查 `v-slot` 用法是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/valid-v-text` | 检查 `v-text` 用法是否合法。 | 缺失；需要 Vue template parsing。 |
| `vue/html-end-tags` | 检查 HTML 结束标签是否正确。 | 缺失；需要 Vue template parsing。 |
| `vue/html-self-closing` | 检查自闭合标签规则。 | 主要可由格式化器部分接管，但语义级校验缺失。 |
| `vue/no-template-shadow` | 禁止 template 作用域变量遮蔽外层变量。 | 缺失；需要 Vue template parsing。 |
| `vue/require-explicit-emits` | 要求组件显式声明 emits。 | 缺失；需要 Vue template parsing。 |
| `vue/v-bind-style` | 约束 `v-bind` 简写风格。 | 主要是风格规则，格式化可部分接管，但 lint 语义缺失。 |
| `vue/v-on-event-hyphenation` | 约束自定义事件命名连字符风格。 | 缺失；需要 Vue template parsing。 |
| `vue/v-on-style` | 约束 `v-on` 简写风格。 | 主要是风格规则，格式化可部分接管，但 lint 语义缺失。 |
| `vue/v-slot-style` | 约束 `v-slot` 写法风格。 | 主要是风格规则，格式化可部分接管，但 lint 语义缺失。 |
| `vue/attributes-order` | 约束 template 属性排序。 | 缺失；需要 Vue template parsing。 |
| `vue/block-order` | 约束 SFC 中 `<script>` / `<template>` / `<style>` 块顺序。 | 缺失；需要 Vue SFC/template 结构分析。 |
| `vue/no-lone-template` | 禁止不必要的单独 `<template>` 包裹。 | 缺失；需要 Vue template parsing。 |
| `vue/no-v-html` | 禁止使用有 XSS 风险的 `v-html`。 | 缺失；需要 Vue template parsing。 |
| `vue/this-in-template` | 约束 template 中是否允许使用 `this`。 | 缺失；需要 Vue template parsing。 |

## `@eslint-react` 功能覆盖情况

### 有 Oxlint 等价规则，但当前配置未全部启用

这些不算“找不到相同功能的规则”，但如果希望迁移前后检查强度一致，需要在 `.oxlintrc.json` 中显式启用对应 Oxlint 规则。

| 迁移前规则 | 功能说明 | Oxlint 等价规则 |
| --- | --- | --- |
| `@eslint-react/exhaustive-deps` | 检查 Hooks 依赖数组是否完整。 | `react/exhaustive-deps` |
| `@eslint-react/rules-of-hooks` | 检查 Hooks 只能在组件或自定义 Hook 顶层调用。 | `react/rules-of-hooks` |
| `@eslint-react/no-array-index-key` | 禁止把数组下标作为 React `key`。 | `react/no-array-index-key` |
| `@eslint-react/no-missing-key` | 检查列表渲染元素是否缺少 `key`。 | `react/jsx-key` |
| `@eslint-react/no-direct-mutation-state` | 禁止直接修改 class component 的 state。 | `react/no-direct-mutation-state` |
| `@eslint-react/no-set-state-in-component-did-mount` | 禁止在 `componentDidMount` 中直接 `setState`。 | `react/no-did-mount-set-state` |
| `@eslint-react/no-set-state-in-component-did-update` | 禁止在 `componentDidUpdate` 中直接 `setState`。 | `react/no-did-update-set-state` |
| `@eslint-react/no-set-state-in-component-will-update` | 禁止在 `componentWillUpdate` 中直接 `setState`。 | `react/no-will-update-set-state` |
| `@eslint-react/no-nested-component-definitions` | 禁止在组件内部定义不稳定的嵌套组件。 | `react/no-unstable-nested-components` |
| `@eslint-react/no-children-count` | 禁止使用 `React.Children.count`。 | `react/no-react-children` 覆盖 React.Children 使用场景。 |
| `@eslint-react/no-children-for-each` | 禁止使用 `React.Children.forEach`。 | `react/no-react-children` 覆盖 React.Children 使用场景。 |
| `@eslint-react/no-children-map` | 禁止使用 `React.Children.map`。 | `react/no-react-children` 覆盖 React.Children 使用场景。 |
| `@eslint-react/no-children-only` | 禁止使用 `React.Children.only`。 | `react/no-react-children` 覆盖 React.Children 使用场景。 |
| `@eslint-react/no-children-to-array` | 禁止使用 `React.Children.toArray`。 | `react/no-react-children` 覆盖 React.Children 使用场景。 |
| `@eslint-react/jsx-no-children-prop` | 禁止通过 `children` prop 传子节点。 | `react/no-children-prop` |
| `@eslint-react/jsx-no-comment-textnodes` | 禁止 JSX 中出现会渲染成文本的注释。 | `react/jsx-no-comment-textnodes` |
| `@eslint-react/jsx-no-namespace` | 禁止 JSX 命名空间语法。 | `react/no-namespace` |
| `@eslint-react/dom-no-dangerously-set-innerhtml` | 警告 `dangerouslySetInnerHTML` 的风险。 | `react/no-danger` |
| `@eslint-react/dom-no-dangerously-set-innerhtml-with-children` | 禁止同时使用 `dangerouslySetInnerHTML` 和 children。 | `react/no-danger-with-children` |
| `@eslint-react/dom-no-find-dom-node` | 禁止使用已废弃的 `findDOMNode`。 | `react/no-find-dom-node` |
| `@eslint-react/dom-no-render-return-value` | 禁止使用 `ReactDOM.render` 的返回值。 | `react/no-render-return-value` |
| `@eslint-react/dom-no-script-url` | 禁止 `javascript:` URL。 | `react/jsx-no-script-url` |
| `@eslint-react/dom-no-unsafe-iframe-sandbox` | 检查 iframe sandbox 安全性。 | `react/iframe-missing-sandbox` 可覆盖 iframe sandbox 缺失场景，但不一定完全等价。 |
| `@eslint-react/dom-no-void-elements-with-children` | 禁止 void DOM 元素带 children。 | `react/void-dom-elements-no-children` |
| `@eslint-react/dom-no-unsafe-target-blank` | 要求 `target="_blank"` 搭配安全的 `rel`。 | `react/jsx-no-target-blank` |
| `@eslint-react/no-component-will-mount` | 禁止使用旧生命周期 `componentWillMount`。 | `react/no-unsafe` 覆盖不安全生命周期。 |
| `@eslint-react/no-component-will-receive-props` | 禁止使用旧生命周期 `componentWillReceiveProps`。 | `react/no-unsafe` 覆盖不安全生命周期。 |
| `@eslint-react/no-component-will-update` | 禁止使用旧生命周期 `componentWillUpdate`。 | `react/no-unsafe` 覆盖不安全生命周期。 |
| `@eslint-react/no-unsafe-component-will-mount` | 禁止 `UNSAFE_componentWillMount`。 | `react/no-unsafe` |
| `@eslint-react/no-unsafe-component-will-receive-props` | 禁止 `UNSAFE_componentWillReceiveProps`。 | `react/no-unsafe` |
| `@eslint-react/no-unsafe-component-will-update` | 禁止 `UNSAFE_componentWillUpdate`。 | `react/no-unsafe` |
| `@eslint-react/use-state` | 检查 `useState` 返回值命名和使用约定。 | `react/hook-use-state` |

### 找不到明确等价规则的 `@eslint-react` 功能缺失

| 迁移前规则 | 功能说明 | Oxlint 等价覆盖 |
| --- | --- | --- |
| `@eslint-react/error-boundaries` | 检查错误边界组件写法是否安全、合理。 | 未找到明确等价规则。 |
| `@eslint-react/no-access-state-in-setstate` | 禁止在 `setState` 中直接读取不安全的 `this.state`。 | 未找到明确等价规则。 |
| `@eslint-react/no-context-provider` | 限制或禁止特定 Context Provider 写法。 | 未找到明确等价规则。 |
| `@eslint-react/no-create-ref` | 禁止使用 `createRef`，倾向使用 callback ref 或 `useRef`。 | 未找到明确等价规则。 |
| `@eslint-react/no-forward-ref` | 限制使用 `forwardRef`。 | 未找到明确等价规则；`react/forward-ref-uses-ref` 只检查 `forwardRef` 是否使用 ref 参数。 |
| `@eslint-react/no-nested-lazy-component-declarations` | 禁止在组件内部声明 `lazy` 组件。 | 未找到明确等价规则。 |
| `@eslint-react/no-unnecessary-use-prefix` | 检查不必要的 `use` 前缀命名。 | 未找到明确等价规则。 |
| `@eslint-react/no-unused-class-component-members` | 检查 class component 中未使用的成员。 | 未找到明确等价规则。 |
| `@eslint-react/no-use-context` | 限制直接使用 `useContext`。 | 未找到明确等价规则。 |
| `@eslint-react/purity` | 检查组件/Hook 是否保持渲染纯净。 | 未找到明确等价规则；`react/react-compiler` 可能部分覆盖，但属于 nursery 且语义更宽。 |
| `@eslint-react/set-state-in-effect` | 检查 effect 中不合理的 setState。 | 未找到明确等价规则。 |
| `@eslint-react/set-state-in-render` | 禁止渲染期间 setState。 | 未找到明确等价规则。 |
| `@eslint-react/static-components` | 要求组件定义保持静态，避免每次渲染创建新组件。 | 未找到明确等价规则；`react/no-unstable-nested-components` 只覆盖部分场景。 |
| `@eslint-react/unsupported-syntax` | 检查 React Compiler 不支持的语法。 | 未找到明确等价规则；`react/react-compiler` 可能部分覆盖但不等价。 |
| `@eslint-react/use-memo` | 检查 memoization 相关约定。 | 未找到明确等价规则。 |
| `@eslint-react/jsx-no-children-prop-with-children` | 禁止同时传 `children` prop 和 JSX children。 | 未找到明确等价规则；`react/no-children-prop` 只覆盖 children prop。 |
| `@eslint-react/jsx-no-key-after-spread` | 禁止把 `key` 放在 spread props 后面导致覆盖顺序问题。 | 未找到明确等价规则。 |
| `@eslint-react/jsx-no-leaked-dollar` | 禁止 JSX 中泄漏 `$` 字符。 | 未找到明确等价规则。 |
| `@eslint-react/jsx-no-leaked-semicolon` | 禁止 JSX 中泄漏分号文本。 | 未找到明确等价规则。 |
| `@eslint-react/rsc-function-definition` | 检查 React Server Components 函数组件定义方式。 | 未找到明确等价规则。 |
| `@eslint-react/dom-no-flush-sync` | 禁止使用可能影响并发渲染的 `flushSync`。 | 未找到明确等价规则。 |
| `@eslint-react/dom-no-hydrate` | 禁止使用旧的 `hydrate` API。 | 未找到明确等价规则。 |
| `@eslint-react/dom-no-render` | 禁止使用旧的 `render` API。 | 未找到明确等价规则。 |
| `@eslint-react/dom-no-use-form-state` | 禁止或限制特定 DOM/form state API 用法。 | 未找到明确等价规则。 |
| `@eslint-react/web-api-no-leaked-event-listener` | 检查事件监听是否正确清理，避免泄漏。 | 未找到明确等价规则。 |
| `@eslint-react/web-api-no-leaked-fetch` | 检查 fetch 是否在组件生命周期中正确取消或处理。 | 未找到明确等价规则。 |
| `@eslint-react/web-api-no-leaked-intersection-observer` | 检查 IntersectionObserver 是否清理。 | 未找到明确等价规则。 |
| `@eslint-react/web-api-no-leaked-interval` | 检查 interval 是否清理。 | 未找到明确等价规则。 |
| `@eslint-react/web-api-no-leaked-resize-observer` | 检查 ResizeObserver 是否清理。 | 未找到明确等价规则。 |
| `@eslint-react/web-api-no-leaked-timeout` | 检查 timeout 是否清理。 | 未找到明确等价规则。 |
| `@eslint-react/naming-convention-context-name` | 检查 Context 命名约定。 | 未找到明确等价规则。 |
| `@eslint-react/naming-convention-id-name` | 检查 ID 相关命名约定。 | 未找到明确等价规则。 |
| `@eslint-react/immutability` | 检查 React 代码中直接修改对象/数组等不可变性问题。 | 未找到明确等价规则。 |
| `@eslint-react/refs` | 检查 ref 是否在渲染期间被不安全读写。 | 未找到明确等价规则。 |
| `@eslint-react/globals` | 检查渲染期间修改全局变量等副作用。 | 未找到明确等价规则。 |

## CLI glob 行为说明

当前实测结果：

```bash
pnpm exec oxlint '{apps,packages}/**/*.{ts,tsx,js,jsx,vue}' --no-error-on-unmatched-pattern
```

结果是 Oxlint 运行成功但检查了 `0 files`。这说明被引号包住的 brace glob 没有被 Oxlint CLI 当作文件集合展开。

而：

```bash
pnpm exec oxfmt --check '{apps,packages}/**/*.*'
```

可以正常匹配并检查文件，说明 `oxfmt` CLI 自身支持这种 glob 输入。

因此建议 Oxlint 脚本使用路径参数，而不是被引号包住的 brace glob：

```json
{
  "lint": "oxlint apps packages",
  "lint:fix": "oxlint --fix apps packages",
  "lint:error": "oxlint --quiet apps packages"
}
```

注意：`.oxlintrc.json` 里的 `overrides.files` 仍然支持 glob；这里说的是 Oxlint CLI 的位置参数行为。
