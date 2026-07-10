import createTsdownConfig from '../../tsdown.config.base.ts';

export default createTsdownConfig({
  entry: {
    index: 'src/index.ts',
    components: 'src/components/index.ts',
    hooks: 'src/hooks/index.ts',
    utils: 'src/utils/index.ts',
  },
  deps: {
    neverBundle: [/^@tonar\/react-kit(?:\/.+)?$/, '@tonar/utils'],
  },
});
