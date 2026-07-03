import vue from '@vitejs/plugin-vue';
import { createVitestConfig } from '../../vitest.base.config';

export default createVitestConfig(__dirname, {
  plugins: [vue()],
});
