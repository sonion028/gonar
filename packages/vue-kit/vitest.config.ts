import vue from '@vitejs/plugin-vue';
import { createVitestConfig } from '../../vitest.config.base';

export default createVitestConfig(__dirname, {
  plugins: [vue()],
});
