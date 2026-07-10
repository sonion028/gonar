import createTsdownConfig from '../../tsdown.config.base.ts';

export default createTsdownConfig({
  entry: {
    index: 'src/index.ts',
    components: 'src/components.ts',
    hooks: 'src/hooks.ts',
    utils: 'src/utils.ts',
  },
  deps: {
    neverBundle: [/^@tonar\/react-kit(?:\/.+)?$/, '@tonar/utils'],
  },
});
