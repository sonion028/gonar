import { defineConfig } from 'rolldown';
import path from 'path';
import { dts } from 'rolldown-plugin-dts';
import cssRolldown from 'rolldown-plugin-css';

// 入口 重复提取公共
const INPUTS = {
  index: 'src/index.ts',
  hooks: 'src/hooks/index.ts',
  utils: 'src/utils/index.ts',
  components: 'src/components/index.ts',
};

export default defineConfig([
  {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    input: INPUTS,
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].[format].js', // 不用后缀
      chunkFileNames: 'js/[name].[hash].js', // 除入口外的 chunk 文件放js文件夹
      minify: true, // 压缩 js 文件
      // 设置生成的代码目标版本
      generatedCode: {
        preset: 'es5', // 可选值: 'es5' | 'es2015'
        symbols: true,
      },
    },
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [cssRolldown({ minify: true, cssModules: true })],
  },
  // dts 类型声明生成
  {
    input: INPUTS,
    output: [
      {
        dir: 'dist/types',
        format: 'es',
      },
    ],
    plugins: [
      ...dts({
        tsconfig: 'tsconfig.json',
        emitDtsOnly: true,
        tsgo: true,
        // 以下oxc需要，需要显式返回，不推荐
        // oxc: true,
        // resolver: 'oxc',
        // compilerOptions: {
        //   declaration: true, // 生成类型声明
        //   isolatedDeclarations: true, // 生成隔离的类型声明，要求显式的返回类型
        // },
      }),
    ],
  },
]);
