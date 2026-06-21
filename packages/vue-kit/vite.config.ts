import { defineConfig, mergeConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import baseConfig from '../../vite.base.config';
import dts from 'unplugin-dts/vite';

export default mergeConfig(
  baseConfig(),
  defineConfig({
    plugins: [
      vue(),
      dts({
        outDirs: 'dist/types',
        compilerOptions: {
          rootDir: 'src',
        },
      }), // 生成类型声明文件
    ],
    build: {
      lib: {
        entry: {
          index: 'src/index.ts',
          // composables: 'src/composables/index.ts',
          components: 'src/components/index.ts',
        },
      },
      rolldownOptions: {
        external: ['vue'],
      },
    },
  })
);
