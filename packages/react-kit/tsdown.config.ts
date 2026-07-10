import createTsdownConfig from '../../tsdown.config.base.ts';

export default createTsdownConfig({
    entry: {
      index: 'src/index.ts',
      hooks: 'src/hooks/index.ts',
      components: 'src/components/index.ts',
    },
    deps: {
      neverBundle: ['react', 'react-dom', 'react/jsx-runtime', '@tonar/utils'],
    },
  });
