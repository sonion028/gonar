import { defineConfig } from 'rollup';
import path from 'path';
import { fileURLToPath } from 'url';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import { swc } from 'rollup-plugin-swc3';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';
import { cssRollup } from 'rolldown-plugin-css';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 入口 重复提取公共
const INPUTS = {
  index: 'src/index.ts',
  hooks: 'src/hooks/index.ts',
  utils: 'src/utils/index.ts',
  components: 'src/components/index.ts',
};

export default defineConfig([
  {
    input: INPUTS,
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].esm.js',
      chunkFileNames: 'js/[name].[hash].js', // 除入口外的 chunk 文件放js文件夹
      // 设置生成的代码目标版本
      generatedCode: {
        preset: 'es2015',
        symbols: true,
      },
    },
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [
      alias({
        entries: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
      }),
      resolve({ extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'] }),
      swc(),
      cssRollup(),
      terser(),
    ],
  },
  // dts 类型声明生成
  {
    input: INPUTS,
    output: [
      {
        dir: 'dist/types',
        format: 'es',
        // 先观察是否需要保留目录结构
        // preserveModules: true, // 不打包保留目录结构，结合之生成.d.ts配置，是类型声明代目录结构
      },
    ],
    plugins: [dts({ tsconfig: 'tsconfig.json' })],
  },
]);
