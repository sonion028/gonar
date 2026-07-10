import { defineConfig, mergeConfig, type UserConfig } from 'tsdown';

const shared = {
  // 输出配置
  format: 'esm', // 输出 ESM
  target: 'es2020',
  platform: 'browser', // React 库面向浏览器，同时让 ESM 输出 .js 而非 .mjs
  outDir: 'dist',
  clean: true,
  // 构建优化
  minify: false, // 库构建通常不压缩
  treeshake: true, // 启用 tree-shaking
} satisfies UserConfig;

const baseConfig = defineConfig([
  {
    ...shared,
    // 不生成类型声明文件
    dts: false,
    outputOptions: {
      entryFileNames: '[name].[format].js', // 不用后缀
      chunkFileNames: 'js/[name].[hash].js', // 除入口外的 chunk 文件放js文件夹
    },

    // CSS 配置
    css: {
      // 启用 CSS Modules
      modules: {
        // 配置 CSS Modules 的生成类名格式
        generateScopedName: '[local]__[hash]',
        localsConvention: 'camelCaseOnly', // 推荐使用驼峰命名
      },
      fileName: 'css/index.css',
      inject: true,
    },
  },
  {
    ...shared,
    outDir: 'dist/types', // 给 dts 任务单独设置 outDir
    unbundle: true, // 不打包，每个源文件独立编译，保留目录结构。结合后面的只输出.d.ts的设置
    dts: {
      emitDtsOnly: true, // 只输出 .d.ts，不重复生成 JS
    },
  },
]);

export default (config: UserConfig = {}) =>
  defineConfig(baseConfig.map((item) => mergeConfig(item, config)));
