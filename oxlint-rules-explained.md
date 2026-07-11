# Oxlint 规则说明

## 概述

### 配置结构

`.oxlintrc.json` 配置文件包含两个 `overrides` 块：

1. **通用规则**（`**/*.{ts,tsx,js,jsx,vue}`）：ESLint、TypeScript、JSDoc、Unicorn、Vue 规则
2. **React 规则**（`packages/react-kit/**/*.{ts,tsx,js,jsx}`）：React 规则

### categories 设置

当前配置设置了 `categories: { correctness: "off" }`，关闭了所有"正确性"类别的规则。oxlint 内置默认开启 113 条 correctness 类规则，但此设置将它们全部关闭，然后在 `overrides` 中逐条手动启用。

### 默认值说明

- **✅ 开启**：oxlint 不带任何配置文件时默认开启（severity 通常为 warn）
- **off**：oxlint 默认关闭

> 注意：由于当前配置设置了 `categories: { correctness: "off" }`，所有 correctness 规则在当前配置中的实际默认值是 off，需在 `overrides` 中手动开启。

---

## 通用规则（`**/*.{ts,tsx,js,jsx,vue}`）

### ESLint 核心规则

| 规则 | 作用（通俗解释） | 当前值 | oxlint 默认 | 类别 |
|------|----------------|--------|------------|------|
| `constructor-super` | 检查子类构造函数中是否正确调用了 `super()`，不能漏调也不能重复调 | error | ✅ 开启 | correctness |
| `for-direction` | 检查 for 循环计数器是否朝正确方向变化，防止 `i++` 写成 `i--` 导致死循环 | error | ✅ 开启 | correctness |
| `getter-return` | 检查 getter 函数是否有 `return` 语句，没返回值的 getter 会得到 `undefined` | error | ✅ 开启 | correctness |
| `no-async-promise-executor` | 禁止在 `new Promise(async (resolve) => {})` 中用 async 函数，容易丢异常 | error | ✅ 开启 | correctness |
| `no-case-declarations` | 禁止在 `case` 分支中直接写 `let`/`const`/`function`/`class` 声明（需用 `{}` 包裹） | error | off | pedantic |
| `no-class-assign` | 禁止修改 class 声明的变量（如 `class Foo {} Foo = 1`） | error | ✅ 开启 | correctness |
| `no-compare-neg-zero` | 禁止用 `===` 比较负零（`-0`），应该用 `Object.is(x, -0)` | error | ✅ 开启 | correctness |
| `no-cond-assign` | 禁止在条件表达式中写赋值（`if (a = 1)`），防止把 `==` 写成 `=` | error | ✅ 开启 | correctness |
| `no-const-assign` | 禁止修改 `const` 声明的变量 | error | ✅ 开启 | correctness |
| `no-constant-binary-expression` | 检查总是为 true 或 false 的二元表达式（如 `x && true` 中的 `&& true` 没意义） | error | ✅ 开启 | correctness |
| `no-constant-condition` | 禁止在条件中使用常量（如 `if (true)`、`while (1)`），多半是写错了 | error | ✅ 开启 | correctness |
| `no-control-regex` | 禁止在正则表达式中使用 ASCII 控制字符（`\x00`-`\x1f`），通常是笔误 | error | ✅ 开启 | correctness |
| `no-debugger` | 禁止使用 `debugger` 语句，防止调试代码遗留在生产环境 | error | ✅ 开启 | correctness |
| `no-delete-var` | 禁止用 `delete` 删除变量（`delete` 只该用于对象属性） | error | ✅ 开启 | correctness |
| `no-dupe-class-members` | 禁止类中有重复的成员名（如两个 `foo()` 方法） | error | ✅ 开启 | correctness |
| `no-dupe-else-if` | 禁止 `if/else if` 链中出现重复的条件（如 `if (a) {} else if (a) {}`） | error | ✅ 开启 | correctness |
| `no-dupe-keys` | 禁止对象字面量中有重复的键（如 `{ a: 1, a: 2 }`） | error | ✅ 开启 | correctness |
| `no-duplicate-case` | 禁止 `switch` 中有重复的 `case` 值 | error | ✅ 开启 | correctness |
| `no-empty` | 禁止空的语句块 `{}`，通常意味着还没写完或忘了实现 | error | ✅ 开启 | correctness |
| `no-empty-character-class` | 禁止正则表达式中使用空的字符类 `[]`，它永远匹配不到东西 | error | ✅ 开启 | correctness |
| `no-empty-pattern` | 禁止使用空的解构模式（如 `const {} = obj`），没有意义 | error | ✅ 开启 | correctness |
| `no-empty-static-block` | 禁止空的 `static {}` 块 | error | ✅ 开启 | correctness |
| `no-ex-assign` | 禁止修改 `catch` 捕获到的错误对象（如 `catch (e) { e = 1 }`） | error | ✅ 开启 | correctness |
| `no-extra-boolean-cast` | 禁止不必要的布尔转换（如 `!!true` 中的 `!!`） | error | ✅ 开启 | correctness |
| `no-fallthrough` | 禁止 `switch` 的 `case` 穿透（忘记写 `break` 或 `return`） | error | ✅ 开启 | correctness |
| `no-func-assign` | 禁止修改 `function` 声明的变量（如 `function foo() {} foo = 1`） | error | ✅ 开启 | correctness |
| `no-global-assign` | 禁止修改全局变量（如 `NaN = 1`、`undefined = 1`） | error | ✅ 开启 | correctness |
| `no-import-assign` | 禁止修改 `import` 导入的绑定 | error | ✅ 开启 | correctness |
| `no-invalid-regexp` | 检查正则表达式是否合法（如 `/(/` 缺少右括号） | error | ✅ 开启 | correctness |
| `no-irregular-whitespace` | 禁止不规则的空白字符（如零宽空格、不换行空格等不可见的坑） | error | ✅ 开启 | correctness |
| `no-loss-of-precision` | 禁止精度丢失的数字字面量（如 `9007199254740993` 超过了 Number.MAX_SAFE_INTEGER） | error | ✅ 开启 | correctness |
| `no-misleading-character-class` | 禁止正则表达式字符类中误导性的写法（如 `/[👍]/` 被拆成两个码元） | error | ✅ 开启 | correctness |
| `no-new-native-nonconstructor` | 禁止用 `new` 调用原生非构造函数（如 `new Symbol()`、`new BigInt()`） | error | ✅ 开启 | correctness |
| `no-nonoctal-decimal-escape` | 禁止在字符串中使用 `\8`、`\9` 等非八进制十进制转义（行为不直观） | error | ✅ 开启 | correctness |
| `no-obj-calls` | 禁止把全局对象当函数调用（如 `Math()`、`JSON()`） | error | ✅ 开启 | correctness |
| `no-prototype-builtins` | 禁止直接在对象上调用 `Object.prototype` 的方法（如 `obj.hasOwnProperty()`），应用 `Object.prototype.hasOwnProperty.call(obj, key)` | error | ✅ 开启 | correctness |
| `no-redeclare` | 禁止重复声明同一个变量 | error | ✅ 开启 | correctness |
| `no-regex-spaces` | 禁止正则表达式中连续的空格（如 `/a   b/`），应用 `\s+` 代替 | error | ✅ 开启 | correctness |
| `no-self-assign` | 禁止自赋值（如 `x = x`），没意义 | error | ✅ 开启 | correctness |
| `no-setter-return` | 禁止在 setter 中 `return` 值（setter 不该有返回值） | error | ✅ 开启 | correctness |
| `no-shadow-restricted-names` | 禁止用保留字做变量名（如 `let eval = 1`、`let arguments = []`） | error | ✅ 开启 | correctness |
| `no-sparse-arrays` | 禁止稀疏数组（如 `[1,,3]`，中间的空位是 `undefined`，容易出错） | error | ✅ 开启 | correctness |
| `no-this-before-super` | 禁止在 `super()` 调用之前使用 `this`（此时 `this` 还没初始化） | error | ✅ 开启 | correctness |
| `no-unassigned-vars` | 检查声明了但从未赋值的变量（如 `let x;` 后面没赋值就用了） | error | ✅ 开启 | correctness |
| `no-unexpected-multiline` | 禁止多行表达式产生歧义（如 `return\n{}` 会被 JS 解析成 `return; {}`） | off | ✅ 开启 | correctness |
| `no-unreachable` | 禁止不可达的代码（如 `return` 后面还写了语句） | error | ✅ 开启 | correctness |
| `no-unsafe-finally` | 禁止在 `finally` 中用 `return`/`throw`/`break`/`continue`，会覆盖 `try`/`catch` 的返回值 | error | ✅ 开启 | correctness |
| `no-unsafe-negation` | 禁止不安全的取反操作（如 `!x in y` 实际是 `(!x) in y`，可能不是你想要的） | error | ✅ 开启 | correctness |
| `no-unsafe-optional-chaining` | 禁止不安全的可选链操作（如 `(a?.b).c` 在 `a` 为 null 时会报错） | error | ✅ 开启 | correctness |
| `no-unused-labels` | 禁止定义了但没使用的标签 | error | ✅ 开启 | correctness |
| `no-unused-private-class-members` | 禁止未使用的私有类成员（如 `#foo` 声明了但没用到） | error | ✅ 开启 | correctness |
| `no-unused-vars` | 检查声明了但未使用的变量，可能是重构遗漏 | warn | ✅ 开启 | correctness |
| `no-useless-backreference` | 禁止正则中无用的反向引用（如 `/\1(a)/`，引用在捕获组前面） | error | ✅ 开启 | correctness |
| `no-useless-catch` | 禁止无用的 `catch`（如 `catch (e) { throw e }`，只做了重新抛出，不如去掉） | error | ✅ 开启 | correctness |
| `no-useless-escape` | 禁止不必要的转义字符（如 `\"a"` 中的 `\` 没必要） | error | ✅ 开启 | correctness |
| `no-with` | 禁止使用 `with` 语句，它会让作用域混乱且无法严格模式 | error | ✅ 开启 | correctness |
| `preserve-caught-error` | 要求在 `catch` 中重新抛出时保留原始错误（如 `throw new Error(e)` 丢失了原始堆栈，应用 `throw new Error(msg, { cause: e })`） | error | ✅ 开启 | correctness |
| `require-yield` | 要求生成器函数（`function*`）中有 `yield` 语句 | error | ✅ 开启 | correctness |
| `use-isnan` | 要求用 `isNaN(x)` 而不是 `x === NaN`（`NaN` 不等于自身，`=== NaN` 永远是 false） | error | ✅ 开启 | correctness |
| `valid-typeof` | 检查 `typeof` 的比较值是否合法（如 `typeof x === 'strn'` 拼错了应该是 `'string'`） | error | ✅ 开启 | correctness |
| `no-array-constructor` | 禁止用 `new Array()` 构造数组，应该用字面量 `[]` | error | off | pedantic |
| `no-unused-expressions` | 禁止无副作用的表达式语句（如 `a && b;` 中的 `a && b` 不产生任何效果） | off | ✅ 开启 | correctness |

### TypeScript 规则

| 规则 | 作用（通俗解释） | 当前值 | oxlint 默认 | 类别 |
|------|----------------|--------|------------|------|
| `typescript/ban-ts-comment` | 禁止使用 `@ts-ignore`、`@ts-nocheck` 等注释绕过类型检查 | error | off | pedantic |
| `typescript/no-duplicate-enum-values` | 禁止枚举中有重复的值（如 `enum A { B = 1, C = 1 }`） | error | off | - |
| `typescript/no-empty-object-type` | 禁止使用空对象类型 `{}`（它表示"任何非 null/undefined 值"），应该用 `Record<string, never>` 或 `object` | error | off | - |
| `typescript/no-explicit-any` | 禁止显式使用 `any` 类型，它会绕过类型检查 | error | off | restriction |
| `typescript/no-extra-non-null-assertion` | 禁止多余的非空断言（如 `foo!!` 中的第二个 `!` 没必要） | error | off | - |
| `typescript/no-misused-new` | 禁止误用 `new` 关键字（如在接口中定义 `new()` 签名却用错了） | error | off | - |
| `typescript/no-namespace` | 禁止使用 TS 的 `namespace`，应该用 ES 模块代替 | error | off | - |
| `typescript/no-non-null-asserted-optional-chain` | 禁止在可选链后使用非空断言（如 `foo?.bar!`，`?.` 和 `!` 矛盾） | error | off | - |
| `typescript/no-require-imports` | 禁止使用 `require()` 导入，应该用 ES `import` | error | off | - |
| `typescript/no-this-alias` | 禁止用别名引用 `this`（如 `const self = this`），应该用箭头函数 | error | off | - |
| `typescript/no-unnecessary-type-constraint` | 禁止不必要的类型约束（如 `<T extends any>` 和 `<T extends unknown>` 没有约束作用） | error | off | - |
| `typescript/no-unsafe-declaration-merging` | 禁止不安全的声明合并（如函数和同名的 class 合并可能导致类型不安全） | error | off | - |
| `typescript/no-unsafe-function-type` | 禁止使用 `Function` 类型，它不安全（接受任何函数，不检查参数和返回值） | error | off | - |
| `typescript/no-wrapper-object-types` | 禁止使用包装对象类型（如 `String`、`Number`），应该用原始类型 `string`、`number` | error | off | - |
| `typescript/prefer-as-const` | 优先用 `as const` 而非字面量类型（如 `const x = 1 as const` 而非 `const x: 1 = 1`） | error | off | - |
| `typescript/prefer-namespace-keyword` | 优先用 `namespace` 关键字而非 `module`（`module` 是旧写法） | error | off | - |
| `typescript/triple-slash-reference` | 禁止使用三斜线引用 `/// <reference path="..." />`，应该用 ES `import` | error | off | - |

### JSDoc 规则

| 规则 | 作用（通俗解释） | 当前值 | oxlint 默认 | 类别 |
|------|----------------|--------|------------|------|
| `jsdoc/check-access` | 检查 `@access` 标签的值是否合法（只能是 `private`/`protected`/`public`/`package`） | warn | off | restriction |
| `jsdoc/check-property-names` | 检查 `@property` 标签的名称是否合法 | warn | off | correctness |
| `jsdoc/check-tag-names` | 检查 JSDoc 标签名是否合法（如 `@para` 拼错了应该是 `@param`） | warn | off | correctness |
| `jsdoc/empty-tags` | 检查不应为空的标签是否有内容（如 `@param` 应该有参数描述） | warn | off | restriction |
| `jsdoc/implements-on-classes` | 要求 `@implements` 只用在 class 上，不能用在函数上 | warn | off | correctness |
| `jsdoc/no-defaults` | 禁止在 `@param` 标签中写默认值（应该在代码中写） | warn | off | - |
| `jsdoc/require-param` | 要求函数有 `@param` 标签来描述每个参数 | warn | off | - |
| `jsdoc/require-param-description` | 要求 `@param` 标签有参数描述 | warn | off | - |
| `jsdoc/require-param-name` | 要求 `@param` 标签有参数名 | warn | off | - |
| `jsdoc/require-param-type` | 要求 `@param` 标签有参数类型 | off | off | - |
| `jsdoc/require-property` | 要求 `@property` 标签有属性名 | warn | off | - |
| `jsdoc/require-property-description` | 要求 `@property` 标签有属性描述 | warn | off | - |
| `jsdoc/require-property-name` | 要求 `@property` 标签有属性名 | warn | off | - |
| `jsdoc/require-property-type` | 要求 `@property` 标签有属性类型 | warn | off | - |
| `jsdoc/require-returns` | 要求有返回值的函数写 `@returns` 标签 | off | off | - |
| `jsdoc/require-returns-description` | 要求 `@returns` 标签有返回值描述 | warn | off | - |
| `jsdoc/require-returns-type` | 要求 `@returns` 标签有返回值类型 | off | off | - |
| `jsdoc/require-throws-description` | 要求 `@throws` 标签有描述 | off | off | - |
| `jsdoc/require-throws-type` | 要求 `@throws` 标签有错误类型 | warn | off | - |
| `jsdoc/require-yields` | 要求生成器函数有 `@yields` 标签 | warn | off | - |
| `jsdoc/require-yields-description` | 要求 `@yields` 标签有描述 | off | off | - |
| `jsdoc/require-yields-type` | 要求 `@yields` 标签有类型 | warn | off | - |

### Unicorn 规则

| 规则 | 作用（通俗解释） | 当前值 | oxlint 默认 | 类别 |
|------|----------------|--------|------------|------|
| `curly` | 要求 `if`/`else`/`for`/`while` 等语句必须用 `{}` 包裹（即使只有一行），防止后续添加语句时出错 | off | off | style |
| `unicorn/empty-brace-spaces` | 检查空大括号 `{}` 内是否有多余空格 | off | off | style |
| `unicorn/no-nested-ternary` | 禁止嵌套的三元表达式（如 `a ? b ? c : d : e`），可读性差 | off | off | style |
| `unicorn/number-literal-case` | 要求数字字面量使用一致的大小写（如 `0xFF` 而非 `0xff`，`0b1010` 而非 `0B1010`） | off | off | style |

### Vue 规则

| 规则 | 作用（通俗解释） | 当前值 | oxlint 默认 | 类别 |
|------|----------------|--------|------------|------|
| `vue/no-arrow-functions-in-watch` | 禁止在 `watch` 中用箭头函数（箭头函数没有 `this`，无法访问组件实例） | error | off | correctness |
| `vue/no-async-in-computed-properties` | 禁止在 `computed` 中使用异步操作（`computed` 必须同步返回值） | error | off | correctness |
| `vue/no-computed-properties-in-data` | 禁止在 `data` 中引用 `computed` 属性（`data` 先于 `computed` 初始化） | error | off | correctness |
| `vue/no-deprecated-data-object-declaration` | 禁止已废弃的 `data` 对象声明方式（Vue 3 中 `data` 必须是函数） | error | off | correctness |
| `vue/no-deprecated-delete-set` | 禁止已废弃的 `Vue.delete`/`this.$delete`（Vue 3 用 `delete` 操作符） | error | off | correctness |
| `vue/no-deprecated-destroyed-lifecycle` | 禁止已废弃的 `destroyed`/`beforeDestroy` 钩子（Vue 3 用 `unmounted`/`beforeUnmount`） | error | off | correctness |
| `vue/no-deprecated-events-api` | 禁止已废弃的 `$on`/`$off`/`$once` 事件 API（Vue 3 移除了事件总线） | error | off | correctness |
| `vue/no-deprecated-model-definition` | 禁止已废弃的 `model` 选项（Vue 3 用 `v-model` 参数） | error | off | correctness |
| `vue/no-deprecated-props-default-this` | 禁止在 props 的 `default` 函数中使用 `this`（Vue 3 不再支持） | error | off | correctness |
| `vue/no-deprecated-vue-config-keycodes` | 禁止已废弃的 `Vue.config.keyCodes`（Vue 3 移除了它） | error | off | correctness |
| `vue/no-dupe-keys` | 禁止 `data`/`props`/`computed` 中有重复的键 | error | off | correctness |
| `vue/no-export-in-script-setup` | 禁止在 `<script setup>` 中使用 `export`（`<script setup>` 本身就是模块） | error | off | correctness |
| `vue/no-expose-after-await` | 禁止在 `await` 之后调用 `expose()`（`expose` 应在同步代码中调用） | error | off | correctness |
| `vue/no-lifecycle-after-await` | 禁止在 `await` 之后注册生命周期钩子（此时组件可能已卸载） | error | off | correctness |
| `vue/no-reserved-component-names` | 禁止用保留名做组件名（如 `component`、`slot`、`template` 等） | error | off | correctness |
| `vue/no-reserved-keys` | 禁止用保留字做 `data`/`props` 的键（如 `$el`、`$emit` 等内部属性） | error | off | correctness |
| `vue/no-reserved-props` | 禁止用保留字做 props 名（如 `key`、`ref`、`class`、`style` 等） | error | off | correctness |
| `vue/no-shared-component-data` | 禁止组件 `data` 用对象而非函数（多实例会共享同一份数据） | error | off | correctness |
| `vue/no-side-effects-in-computed-properties` | 禁止在 `computed` 中产生副作用（如修改 `data`） | error | off | correctness |
| `vue/no-watch-after-await` | 禁止在 `await` 之后注册 `watch`（此时组件可能已卸载） | error | off | correctness |
| `vue/prefer-import-from-vue` | 要求从 `vue` 导入而非 `vue/dist/vue`（确保用 ESM 版本） | error | off | correctness |
| `vue/require-prop-type-constructor` | 要求 prop 的类型是构造函数（如 `String` 而非 `'string'`） | error | off | correctness |
| `vue/require-render-return` | 要求 `render` 函数有 `return` 语句 | error | off | correctness |
| `vue/require-slots-as-functions` | 要求在模板中使用 `$slots.xxx()` 而非 `$slots.xxx`（slots 是函数） | error | off | correctness |
| `vue/return-in-computed-property` | 要求 `computed` 属性的函数有 `return` 语句 | error | off | correctness |
| `vue/return-in-emits-validator` | 要求 `emits` 验证函数有 `return` 语句 | error | off | correctness |
| `vue/valid-define-emits` | 检查 `defineEmits` 的调用是否合法 | error | off | correctness |
| `vue/valid-define-options` | 检查 `defineOptions` 的调用是否合法 | error | off | correctness |
| `vue/valid-define-props` | 检查 `defineProps` 的调用是否合法 | error | off | correctness |
| `vue/valid-next-tick` | 检查 `nextTick` 的调用是否合法（应该用 `await nextTick()` 或 `nextTick(() => {})`） | error | off | correctness |
| `vue/component-definition-name-casing` | 要求组件名用 PascalCase（如 `MyComponent` 而非 `my-component`） | warn | off | style |
| `vue/prop-name-casing` | 要求 prop 名用 camelCase（如 `userName` 而非 `user-name`） | warn | off | style |
| `vue/require-default-prop` | 要求 prop 有默认值 | warn | off | style |
| `vue/require-prop-types` | 要求 prop 有类型定义 | warn | off | style |
| `vue/no-multiple-slot-args` | 禁止给插槽传多个参数（Vue 3 插槽只接受单个 props 对象） | warn | off | - |
| `vue/no-required-prop-with-default` | 禁止有默认值的 prop 同时标记为 `required`（有默认值就不需要必传） | warn | off | - |

---

## React 规则（`packages/react-kit/**/*.{ts,tsx,js,jsx}`）

| 规则 | 作用（通俗解释） | 当前值 | oxlint 默认 | 类别 |
|------|----------------|--------|------------|------|
| `react/only-export-components` | 禁止在组件文件中导出非组件内容（如同时导出常量和组件），会导致 Fast Refresh 失效。`allowConstantExport: true` 允许导出常量 | error (allowConstantExport: true) | off | - |
