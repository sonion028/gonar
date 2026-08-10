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
  { 1: { dts: { emitDtsOnly: true, vue: false } } }
);
