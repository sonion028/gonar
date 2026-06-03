import { defineConfig, mergeConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import baseConfig from '../../vite.base.config';
import dts from 'vite-plugin-dts';

const merged = mergeConfig(
  baseConfig(),
  defineConfig({
    plugins: [
      dts({
        insertTypesEntry: true,
        entryRoot: 'src',
        outDirs: 'dist/types',
        include: ['src/**/*', 'types/**/*'],
        compilerOptions: {
          paths: {
            '@/*': ['./src/*'],
          },
        },
      }), // 生成类型声明文件
      react(),
      libInjectCss(), // 注入 CSS 到每个生成的 chunk 文件
    ],
    // CSS 配置
    css: {
      modules: {
        localsConvention: 'camelCaseOnly', // 推荐使用驼峰命名
      },
    },
    build: {
      lib: {
        entry: {
          hooks: 'src/hooks/index.ts',
          components: 'src/components/index.ts',
        },
      },
      rolldownOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime', '@gonar/utils'],
        output: {
          chunkFileNames: 'js/[name].[hash].js', // 除入口外的 chunk 文件放js文件夹
        },
      },
    },
  })
);

console.log('======>', merged);
export default merged;
