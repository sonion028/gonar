import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig({
  plugins: [
    react(),
    libInjectCss(), // 注入 CSS 到每个生成的 chunk 文件
    dts({
      insertTypesEntry: true,
      outDir: 'dist/types',
      include: ['src/**/*'],
    }), // 生成类型声明文件
  ],
  resolve: {
    // tsconfigPaths: true, // 启用 tsconfig 路径解析
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // CSS 配置
  css: {
    modules: {
      localsConvention: 'camelCaseOnly', // 推荐使用驼峰命名
    },
  },
  build: {
    target: 'es2020',
    lib: {
      name: 'Tonar',
      entry: {
        index: 'src/index.ts',
        hooks: 'src/hooks/index.ts',
        utils: 'src/utils/index.ts',
        components: 'src/components/index.ts',
      },
      formats: ['es'], // 只输出 ESM
      fileName: '[name].[format]', // 不用后缀
    },
    rolldownOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        assetFileNames: ({ names: [name] }) =>
          `${name.endsWith('.css') ? 'css' : 'assets'}/[name].[hash][extname]`,
        chunkFileNames: 'js/[name].[hash].js', // 除入口外的 chunk 文件放js文件夹
      },
    },
  },
});
