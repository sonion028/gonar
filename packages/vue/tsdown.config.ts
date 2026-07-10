import createTsdownConfig from '../../tsdown.config.base.ts';

export default createTsdownConfig({
  entry: {
    index: 'src/index.ts',
    components: 'src/components/index.ts',
    composables: 'src/composables/index.ts',
    utils: 'src/utils/index.ts',
  },
  deps: {
    neverBundle: [/^@tonar\/vue-kit(?:\/.+)?$/, '@tonar/utils'],
  },
});
