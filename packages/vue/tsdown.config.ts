import createTsdownConfig from '../../tsdown.config.base.ts';

export default createTsdownConfig({
  entry: {
    index: 'src/index.ts',
    components: 'src/components.ts',
    composables: 'src/composables.ts',
    utils: 'src/utils.ts',
  },
  deps: {
    neverBundle: [/^@tonar\/vue-kit(?:\/.+)?$/, '@tonar/utils'],
  },
});
