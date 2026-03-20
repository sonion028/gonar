import { defineConfig } from 'rolldown';
import path from 'path';
import { dts } from 'rolldown-plugin-dts';
import postcss from 'rollup-plugin-postcss';

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
    plugins: [
      // rollup 插件处理 sass 和 CSS Module
      postcss({
        extensions: ['.css', '.scss'],
        // 让 `.module.scss` 走 CSS Modules
        modules: {
          generateScopedName: '[local]__[hash:base64:5]',
        },
        use: ['sass'],
        extract: 'component.css', // 抽离出 css 文件（库更推荐）,指定输出文件名
        minimize: true, // 压缩 css 文件
      }),
      {
        // 单个css文件的场景，给使用css的chunk注入css文件引用语句
        name: 'inject-single-css-asset-import',
        generateBundle(_, bundle) {
          const isStyleChunk = (name: string) =>
            !!(name.includes('.scss') || name.includes('.css'));
          // 现处理css
          const bundleValues = Object.values(bundle);
          const styleChunk = bundleValues.find(
            (item) => item.type === 'asset' && isStyleChunk(item.fileName)
          );
          const injectedCss = styleChunk?.fileName
            ? (styleChunk.fileName = `css/${styleChunk?.fileName ?? ''}`)
            : '';

          for (const item of bundleValues) {
            if (item.type !== 'chunk') continue;
            // 1. 只有“用到样式”的入口才注入
            const hasStyleImport = Object.keys(item.modules).some(isStyleChunk);
            if (!hasStyleImport) continue;
            // 2. 根据 chunk 实际输出路径，算相对 CSS 路径
            const fromDir = path.posix.dirname(item.fileName);
            const relative = path.posix.relative(fromDir, injectedCss);
            const importPath = relative.startsWith('.')
              ? relative
              : `./${relative}`;
            item.code = `import "${importPath}";\n` + item.code;
          }
        },
      },
    ],
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
