import { defineConfig } from 'oxlint';

export default defineConfig({
  ignorePatterns: ['**/dist/**', '**/node_modules/**'],
  env: {
    builtin: true,
  },
  plugins: ['typescript', 'oxc', 'unicorn'], // 不写默认 typescript、oxc、unicorn
  categories: {
    correctness: 'error',
  },
  options: {
    typeAware: true,
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx,js,jsx,vue}'],
      env: {
        es2020: true,
        browser: true,
      },
      plugins: ['eslint', 'jsdoc', 'promise', 'jsx-a11y', 'import'],
      rules: {
        'no-unused-expressions': 'allow', // Correctness 分类
        'no-unexpected-multiline': 'allow', // Suspicious 分类
        'preserve-caught-error': 'deny', // Suspicious 分类
        'no-case-declarations': 'deny', // Pedantic 分类
        'no-fallthrough': 'deny', // Pedantic 分类
        'no-prototype-builtins': 'deny', // Pedantic 分类
        'no-redeclare': 'deny', // Pedantic 分类
        'no-array-constructor': 'deny', // Pedantic 分类
        'no-empty': 'deny', // Restriction 分类
        'no-regex-spaces': 'deny', // Restriction 分类
        'no-var': 'deny', // Restriction 分类
        'no-undef': 'deny', // Nursery 分类
        'no-useless-assignment': 'deny', // Nursery 分类
        'prefer-const': 'deny', // Style 分类
        curly: 'allow', // Style 分类
        // 👆 eslint插件（内置）
        'typescript/ban-ts-comment': 'error', // Pedantic 分类
        'typescript/no-unsafe-function-type': 'error', // Pedantic 分类
        'typescript/no-empty-object-type': 'error', // Restriction 分类
        'typescript/no-explicit-any': 'error', // Restriction 分类
        'typescript/no-namespace': 'error', // Restriction 分类
        'typescript/no-require-imports': 'error', // Restriction 分类
        'typescript/no-unnecessary-type-constraint': 'error', // Suspicious 分类

        'unicorn/empty-brace-spaces': 'allow', // style 分类
        'unicorn/no-nested-ternary': 'allow', // style 分类
        'unicorn/number-literal-case': 'allow', // style 分类

        'jsdoc/require-param': 'allow', // Pedantic 分类
        'jsdoc/require-param-type': 'allow', // Pedantic 分类
        'jsdoc/require-returns-type': 'allow', // Pedantic 分类
        'jsdoc/require-throws-description': 'allow', // Style 分类
        'jsdoc/require-yields-description': 'allow', // Style 分类
        'jsdoc/require-param-description': 'warn', // Pedantic 分类
        'jsdoc/require-param-name': 'warn', // Pedantic 分类
        'jsdoc/require-returns-description': 'warn', // Pedantic 分类
        'jsdoc/require-throws-type': 'warn', // Pedantic 分类
        'jsdoc/require-yields-type': 'warn', // Pedantic 分类
        'jsdoc/check-access': 'warn', // Restriction 分类
        'jsdoc/empty-tags': 'warn', // Restriction 分类
      },
    },
    {
      files: ['packages/vue-kit/**/*.{ts,tsx,js,jsx,vue}'],
      plugins: ['vue'],
      rules: {
        'vue/no-multiple-slot-args': 'warn', // Restriction 分类
        'vue/component-definition-name-casing': 'warn', // style 分类
        'vue/prop-name-casing': 'warn', // style 分类
        'vue/require-default-prop': 'warn', // style 分类
        'vue/require-prop-types': 'warn', // style 分类
        'vue/no-required-prop-with-default': 'warn', // Suspicious 分类
      },
    },
    {
      files: ['packages/react-kit/**/*.{ts,tsx,js,jsx}'],
      plugins: ['react'],
      rules: {
        'react/only-export-components': [
          'error',
          {
            allowConstantExport: true,
          },
        ], // Restriction 分类
        // React Compiler 检查(oxlint v1.79.0 起由单条 react-compiler 拆分为 22 条细粒度规则):
        // - correctness 类 12 条(refs、purity、immutability、set-state-in-render 等)无需在此配置,
        //   由全局 categories.correctness: 'error' 自动启用
        // - 以下为非 correctness 类,需显式开启:
        'react/capitalized-calls': 'warn', // Suspicious
        'react/hooks': 'warn', // Suspicious,与 rules-of-hooks 重叠,上游默认关闭
        'react/memo-dependencies': 'warn', // Suspicious
        'react/exhaustive-effect-dependencies': 'warn', // Suspicious
        'react/incompatible-library': 'warn', // Suspicious
        'react/todo': 'warn', // Restriction,React Compiler 暂不支持的语法/场景
        'react/rule-suppression': 'warn', // Restriction
        'react/unsupported-syntax': 'warn', // Restriction
        'react/invariant': 'warn', // Restriction,编译器内部一致性检查,极少触发
        'react/no-deriving-state-in-effects': 'warn', // Perf

        'react/no-array-index-key': 'warn', // Perf 分类
        'react/rules-of-hooks': 'deny', // Pedantic 分类
        'react/jsx-no-target-blank': 'deny', // Pedantic 分类
        'react/no-danger': 'deny', // Restriction 分类
        'react/jsx-no-script-url': 'deny', // Suspicious 分类
        'react/no-unstable-nested-components': 'deny', // Suspicious 分类
        'react/no-namespace': 'deny', // Restriction 分类
        'react/require-render-return': 'deny', // Nursery 分类
      },
    },
  ],
});
