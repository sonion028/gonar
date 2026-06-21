import { defineConfig, mergeConfig } from 'vite';
import dts from 'unplugin-dts/vite';

import baseConfig from '../../vite.base.config';

export default mergeConfig(
  baseConfig(),
  defineConfig({
    plugins: [
      dts({
        outDirs: 'dist/types',
        compilerOptions: {
          rootDir: 'src',
          paths: {},
        },
      }), // 生成类型声明文件
    ],
    build: {
      lib: {
        entry: 'src/index.ts',
      },
      rolldownOptions: {
        external: ['@tonar/vue-kit', '@tonar/utils'],
      },
    },
  })
);
