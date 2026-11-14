import createTsdownConfig from '../../tsdown.config.base.ts';

export default createTsdownConfig({
  entry: {
    index: 'src/index.ts',
    common: 'src/common/index.ts',
  },
});
