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
    root: 'src',
    dts: {
      emitDtsOnly: true, // 只输出 .d.ts，不重复生成 JS
    },
  },
]);

/**
 * @author sonion
 * @description 合并基础配置和项目配置
 * @param {UserConfig} config - 通用配置，编译和生成类型声明文件都需要的配置
 * @param {Record<number, UserConfig>} itemConfig - 项目配置，键为配置需要合并的配置的索引，值为配置对象
 * @return {UserConfig[]} - 合并后的配置数组
 */
export default (config: UserConfig, itemConfig?: Record<number, UserConfig>) =>
  defineConfig(
    baseConfig.map((item, index) => {
      // 生成类型的配置用数组，入口文件的.d.ts 才能保留目录结构
      if (
        index >= 1 &&
        config.entry &&
        typeof config.entry === 'object' &&
        !Array.isArray(config.entry)
      ) {
        config.entry = Object.values<string>(
          config.entry as Record<string, string>
        );
      }
      itemConfig?.[index] && Object.assign(config, itemConfig[index]);
      return mergeConfig(item, config);
    })
  );
