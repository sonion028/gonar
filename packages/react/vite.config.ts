import { defineConfig, mergeConfig } from 'vite';
import dts from 'unplugin-dts/vite';

import baseConfig from '../../vite.base.config';

export default mergeConfig(
  baseConfig(),
  defineConfig({
    plugins: [
      dts({
        // entryRoot: 'src',
        outDirs: 'dist/types',
        include: ['src/**/*'],
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
        external: ['@gonar/react-kit', '@gonar/utils'],
      },
    },
  })
);
