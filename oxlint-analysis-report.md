# Oxlint `categories: { correctness: "off" }` 影响分析报告

## 背景说明

`categories: { correctness: "off" }` 把 oxlint 唯一默认启用的规则分类（correctness）关闭了。迁移工具 `@oxlint/migrate` 这样做的目的是避免引入 ESLint 配置中没有的规则。

你的 `overrides.plugins` 启用了 `["typescript", "jsdoc", "unicorn", "vue"]` 四个插件，所以 correctness 分类下的规则来源为：**eslint 核心规则 + 这四个插件的 correctness 规则**。

> ⚠️ **重要提示**：部分 typescript 规则（标记为 💭）是**类型感知规则**，需要通过 `options.typeAware: true` 配置项或 `--type-aware` CLI 标志启用，否则即使配置了也不会运行。这些规则在 oxlint 官方文档中用 💭 标记。

### 关于 correctness 分类的默认级别

**correctness 分类的默认级别是 `warn`，不是 `error`。**

验证方式：`oxlint --print-config`（不带 `categories` 配置时）显示所有 correctness 规则的默认值为 `warn`。实际运行 `eval("foo")` 时，`no-eval`（未在 rules 中显式配置）报告为 **warning**。

---

## 统计总览

| 分类 | 数量 | 说明 |
|------|------|------|
| a. 新增规则（correctness 默认有，rules 里没有） | **35 条** | 删除 `categories: { correctness: "off" }` 后会以 `warn` 级别启用 |
| b. 值不同的规则（rules 里的值 ≠ correctness 默认值 `warn`） | **92 条** | rules 显式覆盖了默认值，由于 rules 优先级高于 categories，行为不变 |
| c. 值相同的规则（rules 里的值 = correctness 默认值 `warn`） | **10 条** | rules 显式声明，行为不变 |
| d. 非 correctness 分类的规则（rules 里有但 correctness 没有） | **39 条** | 不受 correctness 开关影响 |
| **合计** | **176 条** | |

---

## a. 新增规则（35 条）

> 这些规则属于 correctness 分类，但当前 `overrides.rules` 中没有配置。删除 `categories: { correctness: "off" }` 后会自动以 **warn** 级别启用。

### eslint 核心（4 条）

| 规则 | 作用 | 当前值 | 默认值 |
|------|------|--------|--------|
| no-caller | 禁止 `arguments.callee` 和 `Function.prototype.caller` | 未配置 | warn |
| no-eval | 禁止使用 `eval()` | 未配置 | warn |
| no-iterator | 禁止使用 `__iterator__` 属性 | 未配置 | warn |
| no-useless-rename | 禁止解构或导入时使用无意义的重命名 | 未配置 | warn |

### typescript 插件（17 条）

> 其中标记为 💭 的规则是类型感知规则，需要 `options.typeAware: true` 才能生效。

| 规则 | 作用 | 当前值 | 默认值 |
|------|------|--------|--------|
| 💭 typescript/await-thenable | 禁止对非 thenable 值使用 await | 未配置 | warn |
| typescript/no-array-delete | 禁止使用 `delete` 操作符删除数组元素 | 未配置 | warn |
| 💭 typescript/no-base-to-string | 禁止将无意义的值隐式转换为字符串 | 未配置 | warn |
| 💭 typescript/no-duplicate-type-constituents | 禁止联合/交叉类型中出现重复的类型成员 | 未配置 | warn |
| 💭 typescript/no-floating-promises | 要求 Promise 被正确处理 | 未配置 | warn |
| typescript/no-for-in-array | 禁止对数组使用 `for-in` | 未配置 | warn |
| 💭 typescript/no-implied-eval | 禁止 `setTimeout`/`setInterval` 传字符串参数 | 未配置 | warn |
| 💭 typescript/no-meaningless-void-operator | 禁止对 `void` 表达式使用无意义的一元运算符 | 未配置 | warn |
| 💭 typescript/no-misused-spread | 禁止误用展开运算符 | 未配置 | warn |
| 💭 typescript/no-redundant-type-constituents | 禁止联合类型中出现冗余的类型 | 未配置 | warn |
| 💭 typescript/no-unnecessary-parameter-property-assignment | 禁止构造函数中不必要的参数属性赋值 | 未配置 | warn |
| 💭 typescript/no-unsafe-unary-minus | 禁止对数字使用一元 `-` 运算符（可能意图为 `~`） | 未配置 | warn |
| 💭 typescript/no-useless-default-assignment | 禁止在解构中使用无意义的默认值赋值 | 未配置 | warn |
| typescript/no-useless-empty-export | 禁止无意义的空 `export {}` | 未配置 | warn |
| 💭 typescript/require-array-sort-compare | 要求数组排序时传入比较函数 | 未配置 | warn |
| 💭 typescript/restrict-template-expressions | 限制模板字符串中的表达式类型 | 未配置 | warn |
| 💭 typescript/unbound-method | 禁止未绑定的方法作为回调 | 未配置 | warn |

### jsdoc 插件（0 条）

所有 jsdoc correctness 规则已在 rules 中配置。

### unicorn 插件（13 条）

| 规则 | 作用 | 当前值 | 默认值 |
|------|------|--------|--------|
| unicorn/no-await-in-promise-methods | 禁止在非异步方法中使用 `await` | 未配置 | warn |
| unicorn/no-empty-file | 禁止空文件 | 未配置 | warn |
| unicorn/no-invalid-fetch-options | 禁止无效的 `fetch` 选项 | 未配置 | warn |
| unicorn/no-invalid-remove-event-listener | 禁止 `removeEventListener(null)` 等无效调用 | 未配置 | warn |
| unicorn/no-new-array | 禁止 `new Array()`，应使用 `Array.from()` 或字面量 | 未配置 | warn |
| unicorn/no-single-promise-in-promise-methods | 禁止在 `Promise.all` 等方法中只传入单个 Promise | 未配置 | warn |
| unicorn/no-thenable | 禁止定义 thenable 对象 | 未配置 | warn |
| unicorn/no-unnecessary-await | 禁止对非 Promise 值使用 `await` | 未配置 | warn |
| unicorn/no-useless-fallback-in-spread | 禁止在展开运算符中使用无意义的回退 | 未配置 | warn |
| unicorn/no-useless-length-check | 禁止无意义的数组长度检查 | 未配置 | warn |
| unicorn/no-useless-spread | 禁止无意义的展开运算 | 未配置 | warn |
| unicorn/prefer-set-size | 建议使用 `Set.size` 而非 `Array.from(set).length` | 未配置 | warn |
| unicorn/prefer-string-starts-ends-with | 建议使用 `startsWith()`/`endsWith()` 而非正则 | 未配置 | warn |

### vue 插件（1 条）

| 规则 | 作用 | 当前值 | 默认值 |
|------|------|--------|--------|
| vue/no-this-in-before-route-enter | 禁止在 `beforeRouteEnter` 守卫中使用 `this` | 未配置 | warn |

---

## b. 值不同的规则（92 条）

> 这些规则属于 correctness 分类（默认 `warn`），且已在 `overrides.rules` 中配置，但**显式设置的值 ≠ 默认值 `warn`**。由于 oxlint 中 `rules` 的值优先于 `categories` 的值，删除 `categories: { correctness: "off" }` 后，**这些规则的行为不会改变**。

### eslint 核心（52 条）

> 当前值为 `error`（51 条）或 `off`（1 条），与默认值 `warn` 不同。

| 规则 | 作用 | 当前值 | 默认值 |
|------|------|--------|--------|
| constructor-super | 要求派生类中调用 `super()` | error | warn |
| for-direction | 强制 `for` 循环的更新方向正确 | error | warn |
| getter-return | 要求 getter 函数必须有返回值 | error | warn |
| no-async-promise-executor | 禁止在 Promise 构造函数中使用 async 函数 | error | warn |
| no-class-assign | 禁止修改类声明的变量 | error | warn |
| no-compare-neg-zero | 禁止与 `-0` 进行比较 | error | warn |
| no-cond-assign | 禁止在条件表达式中使用赋值运算符 | error | warn |
| no-const-assign | 禁止修改 `const` 声明的变量 | error | warn |
| no-constant-binary-expression | 禁止在条件中使用常量表达式 | error | warn |
| no-constant-condition | 禁止在条件中使用常量表达式 | error | warn |
| no-control-regex | 禁止在正则表达式中使用控制字符 | error | warn |
| no-debugger | 禁止使用 `debugger` 语句 | error | warn |
| no-delete-var | 禁止删除变量 | error | warn |
| no-dupe-class-members | 禁止类成员中出现重复名称 | error | warn |
| no-dupe-else-if | 禁止 `else if` 中出现与 `if` 中相同的条件 | error | warn |
| no-dupe-keys | 禁止对象字面量中出现重复键 | error | warn |
| no-duplicate-case | 禁止 `switch` 中出现重复的 `case` 标签 | error | warn |
| no-empty-character-class | 禁止正则表达式中的空字符类 | error | warn |
| no-empty-pattern | 禁止使用空的解构模式 | error | warn |
| no-empty-static-block | 禁止空的静态块 | error | warn |
| no-ex-assign | 禁止在 `catch` 子句中对异常参数重新赋值 | error | warn |
| no-extra-boolean-cast | 禁止不必要的布尔类型转换 | error | warn |
| no-func-assign | 禁止对函数声明重新赋值 | error | warn |
| no-global-assign | 禁止对只读全局变量重新赋值 | error | warn |
| no-import-assign | 禁止修改 `import` 声明的绑定 | error | warn |
| no-invalid-regexp | 禁止无效的正则表达式字符串 | error | warn |
| no-irregular-whitespace | 禁止使用不规则的空白字符 | error | warn |
| no-loss-of-precision | 禁止数字字面量精度丢失 | error | warn |
| no-misleading-character-class | 禁止在字符类语法中使用不易理解的多字符转义 | error | warn |
| no-new-native-nonconstructor | 禁止使用 `new Number()` 等非构造函数 | error | warn |
| no-nonoctal-decimal-escape | 禁止使用 `\8`、`\9` 转义序列 | error | warn |
| no-obj-calls | 禁止将全局对象作为函数调用 | error | warn |
| no-self-assign | 禁止自我赋值 | error | warn |
| no-setter-return | 禁止 setter 返回值 | error | warn |
| no-shadow-restricted-names | 禁止覆盖受限名称 | error | warn |
| no-sparse-arrays | 禁止稀疏数组 | error | warn |
| no-this-before-super | 禁止在 `super()` 调用前使用 `this` | error | warn |
| no-unassigned-vars | 禁止声明后从未赋值的变量 | error | warn |
| no-unreachable | 禁止不可达代码 | error | warn |
| no-unsafe-finally | 禁止在 `finally` 块中使用控制流语句 | error | warn |
| no-unsafe-negation | 禁止对关系运算符左操作数使用否定运算符 | error | warn |
| no-unsafe-optional-chaining | 禁止在可选链后使用逻辑运算符 | error | warn |
| no-unused-expressions | 禁止未使用的表达式 | **off** | warn |
| no-unused-labels | 禁止未使用的标签 | error | warn |
| no-unused-private-class-members | 禁止未使用的私有类成员 | error | warn |
| no-useless-backreference | 禁止无意义的反向引用 | error | warn |
| no-useless-catch | 禁止无用的 `catch` 子句 | error | warn |
| no-useless-escape | 禁止不必要的转义字符 | error | warn |
| no-with | 禁止使用 `with` 语句 | error | warn |
| require-yield | 要求生成器函数包含 `yield` | error | warn |
| use-isnan | 要求使用 `isNaN()` 检查 NaN | error | warn |
| valid-typeof | 强制 `typeof` 表达式与有效的字符串进行比较 | error | warn |

### typescript 插件（10 条）

| 规则 | 作用 | 当前值 | 默认值 |
|------|------|--------|--------|
| typescript/no-duplicate-enum-values | 禁止枚举成员出现重复值 | error | warn |
| typescript/no-extra-non-null-assertion | 禁止不必要的非空断言 | error | warn |
| typescript/no-misused-new | 禁止对类构造函数使用 `new` 表达式 | error | warn |
| typescript/no-non-null-asserted-optional-chain | 禁止在可选链后使用非空断言 | error | warn |
| typescript/no-this-alias | 禁止将 `this` 赋值给其他变量 | error | warn |
| typescript/no-unsafe-declaration-merging | 禁止不安全的声明合并 | error | warn |
| typescript/no-wrapper-object-types | 禁止原始类型的包装对象类型 | error | warn |
| typescript/prefer-as-const | 要求使用 `as const` 断言 | error | warn |
| typescript/prefer-namespace-keyword | 要求使用 `namespace` 而非 `module` 关键字 | error | warn |
| typescript/triple-slash-reference | 禁止使用 `/// <reference>` 导入类型 | error | warn |

### jsdoc 插件（0 条）

所有在 rules 中配置的 jsdoc correctness 规则当前值均为 `warn`，与默认值相同，归入 c 类。

### unicorn 插件（0 条）

没有 unicorn correctness 规则在 rules 中配置。

### vue 插件（30 条）

| 规则 | 作用 | 当前值 | 默认值 |
|------|------|--------|--------|
| vue/no-arrow-functions-in-watch | 禁止在 `watch` 选项中使用箭头函数 | error | warn |
| vue/no-async-in-computed-properties | 禁止在计算属性中使用异步操作 | error | warn |
| vue/no-computed-properties-in-data | 禁止在 `data` 中使用计算属性 | error | warn |
| vue/no-deprecated-data-object-declaration | 禁止已弃用的 `data` 对象声明 | error | warn |
| vue/no-deprecated-delete-set | 禁止使用已弃用的 `$delete`、`$set` | error | warn |
| vue/no-deprecated-destroyed-lifecycle | 禁止使用已弃用的 `destroyed` 生命周期 | error | warn |
| vue/no-deprecated-events-api | 禁止使用已弃用的事件 API | error | warn |
| vue/no-deprecated-model-definition | 禁止使用已弃用的 `model` 选项 | error | warn |
| vue/no-deprecated-props-default-this | 禁止在 props 默认函数中使用 `this` | error | warn |
| vue/no-deprecated-vue-config-keycodes | 禁止使用已弃用的 `Vue.config.keycodes` | error | warn |
| vue/no-dupe-keys | 禁止组件中出现重复的键名 | error | warn |
| vue/no-export-in-script-setup | 禁止在 `<script setup>` 中使用 `export` | error | warn |
| vue/no-expose-after-await | 禁止在 `await` 后使用 `expose` | error | warn |
| vue/no-lifecycle-after-await | 禁止在 `await` 后使用生命周期钩子 | error | warn |
| vue/no-reserved-component-names | 禁止使用保留的组件名称 | error | warn |
| vue/no-reserved-keys | 禁止使用保留的键名 | error | warn |
| vue/no-reserved-props | 禁止使用保留的 prop 名称 | error | warn |
| vue/no-shared-component-data | 禁止在 `data` 函数中共享非函数值 | error | warn |
| vue/no-side-effects-in-computed-properties | 禁止在计算属性中产生副作用 | error | warn |
| vue/no-watch-after-await | 禁止在 `await` 后使用 `watch` | error | warn |
| vue/prefer-import-from-vue | 建议从 `vue` 模块导入 | error | warn |
| vue/require-prop-type-constructor | 要求 prop 类型为构造函数 | error | warn |
| vue/require-render-return | 要求 `render` 函数必须有返回值 | error | warn |
| vue/require-slots-as-functions | 要求 `$slots` 以函数方式使用 | error | warn |
| vue/return-in-computed-property | 要求计算属性必须有返回值 | error | warn |
| vue/return-in-emits-validator | 要求 emits 验证函数必须有返回值 | error | warn |
| vue/valid-define-emits | 验证 `defineEmits` 声明是否有效 | error | warn |
| vue/valid-define-options | 验证 `defineOptions` 声明是否有效 | error | warn |
| vue/valid-define-props | 验证 `defineProps` 声明是否有效 | error | warn |
| vue/valid-next-tick | 验证 `nextTick` 使用是否有效 | error | warn |

---

## c. 值相同的规则（10 条）

> 这些规则属于 correctness 分类（默认 `warn`），且已在 `overrides.rules` 中配置，**显式设置的值 = 默认值 `warn`**。

### eslint 核心（1 条）

| 规则 | 作用 | 当前值 | 默认值 |
|------|------|--------|--------|
| no-unused-vars | 禁止未使用的变量 | warn | warn |

### typescript 插件（0 条）

所有在 rules 中配置的 typescript correctness 规则当前值均为 `error`，与默认值 `warn` 不同，归入 b 类。

### jsdoc 插件（9 条）

| 规则 | 作用 | 当前值 | 默认值 |
|------|------|--------|--------|
| jsdoc/check-property-names | 检查 JSDoc `@property` 标签名与代码属性名是否一致 | warn | warn |
| jsdoc/check-tag-names | 检查 JSDoc 标签是否有效 | warn | warn |
| jsdoc/implements-on-classes | 检查 `@implements` 标签是否只用于类 | warn | warn |
| jsdoc/no-defaults | 检查 JSDoc 中不应重复描述已有默认值的参数 | warn | warn |
| jsdoc/require-property | 要求所有属性都有 JSDoc `@property` 标签 | warn | warn |
| jsdoc/require-property-description | 要求 `@property` 标签包含描述 | warn | warn |
| jsdoc/require-property-name | 要求 `@property` 标签包含名称 | warn | warn |
| jsdoc/require-property-type | 要求 `@property` 标签包含类型 | warn | warn |
| jsdoc/require-yields | 要求生成器函数使用 `@yields` 标签 | warn | warn |

### unicorn 插件（0 条）

没有 unicorn correctness 规则在 rules 中配置。

### vue 插件（0 条）

所有在 rules 中配置的 vue correctness 规则当前值均为 `error`，与默认值 `warn` 不同，归入 b 类。

---

## d. 非 correctness 分类的规则（39 条）

> 这些规则在 `overrides.rules` 中配置，但**不属于 correctness 分类**（属于 pedantic、style、restriction 或 suspicious 等分类）。`categories: { correctness: "off" }` 的开关**不影响这些规则**。

### eslint 核心（10 条）

| 规则 | 分类 | 作用 | 当前值 | 默认值 |
|------|------|------|--------|--------|
| no-array-constructor | pedantic | 禁止使用 `Array` 构造函数 | error | — |
| no-case-declarations | pedantic | 禁止在 `case` 子句中使用词法声明 | error | — |
| no-empty | restriction | 禁止空块语句 | error | — |
| no-fallthrough | pedantic | 禁止 `switch` 语句中的 fallthrough | error | — |
| no-prototype-builtins | pedantic | 禁止直接在对象上调用 `hasOwnProperty` 等 | error | — |
| no-redeclare | pedantic | 禁止重复声明变量 | error | — |
| no-regex-spaces | restriction | 禁止正则表达式中出现多个连续空格 | error | — |
| no-unexpected-multiline | suspicious | 检测可能导致不同解析的意外换行 | off | — |
| preserve-caught-error | suspicious | 要求重新抛出错误时使用 `{ cause: err }` | error | — |
| curly | style | 要求控制语句使用大括号 | off | — |

### typescript 插件（7 条）

| 规则 | 分类 | 作用 | 当前值 | 默认值 |
|------|------|------|--------|--------|
| typescript/ban-ts-comment | pedantic | 禁止 `@ts-ignore`、`@ts-nocheck` 等 | error | — |
| typescript/no-empty-object-type | restriction | 禁止使用 `{}` 作为类型 | error | — |
| typescript/no-explicit-any | restriction | 禁止使用 `any` 类型 | error | — |
| typescript/no-namespace | pedantic | 禁止使用 TypeScript `namespace` | error | — |
| typescript/no-require-imports | restriction | 禁止使用 `require()` 导入 | error | — |
| typescript/no-unnecessary-type-constraint | suspicious | 禁止不必要的 `extends unknown` 约束 | error | — |
| typescript/no-unsafe-function-type | restriction | 禁止使用 `Function` 类型 | error | — |

### jsdoc 插件（13 条）

| 规则 | 分类 | 作用 | 当前值 | 默认值 |
|------|------|------|--------|--------|
| jsdoc/check-access | restriction | 检查 `@access` 标签值是否有效 | warn | — |
| jsdoc/empty-tags | restriction | 要求特定 JSDoc 标签为空 | warn | — |
| jsdoc/require-param | pedantic | 要求所有函数参数都有 `@param` 标签 | warn | — |
| jsdoc/require-param-description | pedantic | 要求 `@param` 标签包含描述 | warn | — |
| jsdoc/require-param-name | pedantic | 要求 `@param` 标签包含参数名 | warn | — |
| jsdoc/require-param-type | pedantic | 要求 `@param` 标签包含类型 | off | — |
| jsdoc/require-returns | pedantic | 要求有返回值的函数使用 `@returns` 标签 | off | — |
| jsdoc/require-returns-description | pedantic | 要求 `@returns` 标签包含描述 | warn | — |
| jsdoc/require-returns-type | pedantic | 要求 `@returns` 标签包含类型 | off | — |
| jsdoc/require-throws-description | style | 要求 `@throws` 标签包含描述 | off | — |
| jsdoc/require-throws-type | pedantic | 要求 `@throws` 标签包含类型 | warn | — |
| jsdoc/require-yields-description | style | 要求 `@yields` 标签包含描述 | off | — |
| jsdoc/require-yields-type | pedantic | 要求 `@yields` 标签包含类型 | warn | — |

### unicorn 插件（3 条）

| 规则 | 分类 | 作用 | 当前值 | 默认值 |
|------|------|------|--------|--------|
| unicorn/empty-brace-spaces | style | 要求空花括号内不包含空格 | off | — |
| unicorn/no-nested-ternary | style | 禁止嵌套三元表达式 | off | — |
| unicorn/number-literal-case | style | 要求数字字面量使用一致的大小写 | off | — |

### vue 插件（6 条）

| 规则 | 分类 | 作用 | 当前值 | 默认值 |
|------|------|------|--------|--------|
| vue/component-definition-name-casing | style | 要求组件定义名称使用 PascalCase 或 kebab-case | warn | — |
| vue/no-multiple-slot-args | restriction | 禁止向插槽传递多个参数 | warn | — |
| vue/no-required-prop-with-default | style | 禁止有默认值的 prop 声明为 required | warn | — |
| vue/prop-name-casing | style | 要求 prop 名称使用 camelCase | warn | — |
| vue/require-default-prop | style | 要求 prop 有默认值 | warn | — |
| vue/require-prop-types | style | 要求 prop 有类型声明 | warn | — |

---

## 结论

1. **correctness 分类的默认级别是 `warn`**，不是 `error`。这通过 `oxlint --print-config` 和实际运行验证确认。

2. **删除 `categories: { correctness: "off" }` 后**，correctness 分类恢复默认的 `warn` 级别，所有 correctness 规则都会被启用。

3. **新增的 35 条规则**会以 `warn` 级别启用，主要来自：
   - typescript 插件（17 条，其中 13 条是类型感知规则，需 `options.typeAware: true`）
   - unicorn 插件（13 条）
   - eslint 核心（4 条：`no-caller`、`no-eval`、`no-iterator`、`no-useless-rename`）
   - vue 插件（1 条：`vue/no-this-in-before-route-enter`）
   
   建议评估这些规则是否适合你的项目，如果不需要可以逐条在 rules 中显式设置为 `off`。

4. **92 条值不同的规则**（当前值多为 `error`，默认值是 `warn`）不受影响，因为 oxlint 中 `rules` 的值优先于 `categories` 的值。这些规则是你从默认 `warn` "加强"到 `error` 的。

5. **39 条非 correctness 规则**完全不受影响，它们属于 pedantic、style、restriction 或 suspicious 等分类。

---

## 验证方法说明

本报告的数据通过以下方式验证：

1. **`oxlint --print-config`**：对比有/无 `categories: { correctness: "off" }` 两个配置的输出，获取 correctness 分类的完整规则列表和默认值。
2. **实际运行 oxlint**：创建测试文件（如 `debugger; eval("foo");`），用两个配置分别运行，确认 `no-eval` 在无 `correctness: off` 时以 `warning` 级别报告，在有 `correctness: off` 时不报告。
3. **oxlint 官方文档**（https://oxc.rs/docs/guide/usage/linter/rules）：确认各规则的分类（correctness/pedantic/style/restriction/suspicious）。
4. **oxlint 版本**：1.73.0
