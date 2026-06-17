import type { UserConfig, BuildEnvironmentOptions, LibraryOptions } from 'vite';

type BuildConfig = Omit<BuildEnvironmentOptions, 'lib'> & {
  lib: Omit<LibraryOptions, 'entry'>;
};

export default (): Omit<UserConfig, 'build'> & { build: BuildConfig } => ({
  build: {
    target: 'es2020',
    lib: {
      name: 'Tonar',
      formats: ['es'], // 只输出 ESM
      fileName: '[name].[format]', // 不用后缀
    },
    rolldownOptions: {
      output: {
        chunkFileNames: 'js/[name].[hash].js', // 除入口外的 chunk 文件放js文件夹
        assetFileNames: ({ names: [name] }) =>
          `${name?.endsWith('.css') ? 'css' : 'assets'}/[name].[hash][extname]`,
      },
    },
  },
});
