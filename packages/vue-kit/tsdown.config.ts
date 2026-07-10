import Vue from 'unplugin-vue/rolldown';
import createTsdownConfig from '../../tsdown.config.base.ts';

const config = createTsdownConfig({
  plugins: [Vue({ isProduction: true })],
  entry: {
    index: 'src/index.ts',
    composables: 'src/composables/index.ts',
    components: 'src/components/index.ts',
  },
  deps: {
    neverBundle: ['vue', '@tonar/utils'],
  },
});

// config[1] &&
//   (config[1].dts = {
//     emitDtsOnly: true,
//     vue: true,
//   });
config[1] && (config[1].dts = false);

export default config;
