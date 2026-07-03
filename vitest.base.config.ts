import { defineConfig, mergeConfig, type ViteUserConfig } from 'vitest/config';
import { resolve } from 'node:path';

export const baseConfig = defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});

export const createVitestConfig = (
  dirname: string,
  config: ViteUserConfig = {}
) =>
  mergeConfig(
    mergeConfig(
      baseConfig,
      defineConfig({
        resolve: {
          alias: {
            '@': resolve(dirname, './src'),
          },
        },
      })
    ),
    defineConfig(config)
  );

export default baseConfig;
