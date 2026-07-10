import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'unplugin-dts/vite';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      outDirs: 'dist/types',
      include: ['src/**/*', 'types/**/*'],
      compilerOptions: {
        rootDir: 'src',
      },
    }), // 生成类型声明文件
  ],
  build: {
    target: 'es2020',
    lib: {
      entry: {
        index: 'src/index.ts',
        composables: 'src/composables/index.ts',
        components: 'src/components/index.ts',
      },
      name: 'Tonar',
      formats: ['es'], // 只输出 ESM
      fileName: '[name].[format]', // 不用后缀
    },
    rolldownOptions: {
      external: ['vue', '@tonar/utils'],
      output: {
        chunkFileNames: 'js/[name].[hash].js', // 除入口外的 chunk 文件放js文件夹
        assetFileNames: ({ names: [name] }) =>
          `${name?.endsWith('.css') ? 'css' : 'assets'}/[name].[hash][extname]`,
      },
    },
  },
});
