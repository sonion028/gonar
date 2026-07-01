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
        entry: {
          index: 'src/index.ts',
          components: 'src/components.ts',
          hooks: 'src/hooks.ts',
          utils: 'src/utils.ts',
        },
      },
      rolldownOptions: {
        external: [/^@tonar\/react-kit(?:\/.+)?$/, '@tonar/utils'],
      },
    },
  })
);
