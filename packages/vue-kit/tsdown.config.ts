import Vue from 'unplugin-vue/rolldown';
import createTsdownConfig from '../../tsdown.config.base.ts';

export default createTsdownConfig(
  {
    plugins: [Vue({ isProduction: true })],
    entry: {
      index: 'src/index.ts',
      composables: 'src/composables/index.ts',
      components: 'src/components/index.ts',
    },
    deps: {
      neverBundle: ['vue', '@tonar/utils'],
    },
  },
  // 仅生成类型声明文件，不需要 Vue 插件
  { 1: { dts: { emitDtsOnly: true, vue: true }, plugins: [] } }
);
