import { defineConfig, mergeConfig } from 'vite';
import dts from 'vite-plugin-dts';
import baseConfig from '../../vite.base.config';

export default mergeConfig(
  baseConfig(),
  defineConfig({
    plugins: [
      dts({
        entryRoot: 'src',
        outDirs: 'dist/types',
        include: ['src/**/*'],
      }), // 生成类型声明文件
    ],
    build: {
      lib: {
        entry: 'src/index.ts',
      },
    },
  })
);
