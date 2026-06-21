/// <reference types="node" />
import { defineConfig, globalIgnores } from 'eslint/config';
import type { Linter } from 'eslint';
import globals from 'globals';
import jslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier/flat';
import reactRefresh from 'eslint-plugin-react-refresh';
import pluginReact from '@eslint-react/eslint-plugin';
import jsdoc from 'eslint-plugin-jsdoc';
import pluginVue from 'eslint-plugin-vue';
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript';

const commonRules = {
  'jsdoc/no-undefined-types': 'off', // JSDoc 里的泛型会报错
  'jsdoc/require-returns': 'off', // 关闭 JSDoc 缺少返回值规则
  'jsdoc/require-returns-type': 'off', // 关闭 JSDoc 缺少返回值类型规则
  'jsdoc/require-param-type': 'off', // 关闭 JSDoc 缺少参数类型规则
  '@typescript-eslint/no-unused-expressions': 'off', // 关闭未使用表达式校验，开启React常用的短路规则可能误判
  '@typescript-eslint/no-unused-vars': ['warn'], // 警告未使用变量 如遇到 与tsconfig.json 冲突，以ts为准
} as Linter.RulesRecord;

export default defineConfig([
  globalIgnores(['**/dist/**', '**/node_modules/**']), // 忽略 dist 和 node_modules 目录
  {
    files: ['**/*.{ts,tsx,js,jsx}'], // 对所有 TS TSX JS JSX 文件应用规则
    languageOptions: {
      ecmaVersion: 2020, // 语法检查 支持的 ES 版本
      globals: globals.browser, // 浏览器全局变量
      // env: globals.node, // Node.js 环境变量
      parserOptions: {
        tsconfigRootDir: import.meta.dirname, // 指定 tsconfig 根目录，避免 node_modules 中的 tsconfig 干扰
      },
    },
    settings: {
      jsdoc: {
        mode: 'typescript',
      },
    },
    extends: [
      jslint.configs.recommended, // ✅ JavaScript 规则
      ...tseslint.configs.recommended, // ✅ TypeScript 规则
      jsdoc.configs['flat/recommended'], // ✅ JSDoc 扁平插件配置对象
      prettier, // ✅ 关闭和 Prettier 冲突的规则
    ],
    rules: commonRules,
  },
  // 👇 React 规则
  {
    files: ['packages/react-kit/**/*.{ts,tsx,js,jsx}'], // 仅 React 子包应用 React 规则
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: `${import.meta.dirname}/packages/react-kit`, // 指定 tsconfig
      },
    },
    settings: {
      'react-x': {
        version: '18.0.0', // 指定 React 18
      },
    },
    extends: [
      reactRefresh.configs.vite, // ✅ React Refresh 插件注册; 扁平插件配置对象, vite 环境下需要配置
      pluginReact.configs['recommended-typescript'], // ✅ React TypeScript 扁平插件配置对象
    ],
    rules: {
      '@eslint-react/immutability': 'error', // 不可变数据 手动开启
      '@eslint-react/refs': 'error', // ref不可在渲染过程中更新 手动开启
      '@eslint-react/globals': 'error', // 不在渲染过程中设置状态 手动开启
      '@eslint-react/dom-no-unsafe-target-blank': 'error', // target="_blank" 有没有 rel="noreferrer noopener" 手动开启
      '@eslint-react/exhaustive-deps': 'warn', // 不完整的依赖项
      '@eslint-react/no-clone-element': 'off', // 关闭不可克隆元素
      '@eslint-react/naming-convention-ref-name': 'off', // 关闭ref 名称规范
    },
  },
  // 👇 Vue 规则
  {
    files: ['packages/vue-kit/**/*.{ts,tsx,js,jsx,vue}'],
    extends: [
      pluginVue.configs['flat/recommended'], // ✅ Vue 规则, essential 基本的
    ],
  },
  // vue 文件要单独parser，再应用规则通用规则
  ...(defineConfigWithVueTs({
    files: ['packages/vue-kit/**/*.vue'],
    extends: [
      vueTsConfigs.recommended,
      jsdoc.configs['flat/recommended'],
      prettier,
    ],
    rules: commonRules,
  }) as Linter.Config[]),
]);
