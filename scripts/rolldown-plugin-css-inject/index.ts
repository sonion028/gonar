import path from 'node:path';
import type { Plugin } from 'rolldown';

/**
 *
 */
function cssInjectPlugin(): Plugin {
  return {
    // 单个css文件的场景，给使用css的chunk注入css文件引用语句
    name: 'inject-single-css-asset-import',
    generateBundle(_, bundle) {
      const isStyleChunk = (name: string) =>
        !!(name.includes('.scss') || name.includes('.css'));
      // 现处理css
      const bundleValues = Object.values(bundle);
      const styleChunk = bundleValues.find(
        (item) => item.type === 'asset' && isStyleChunk(item.fileName)
      );
      const injectedCss = styleChunk?.fileName
        ? (styleChunk.fileName = `css/${styleChunk?.fileName ?? ''}`)
        : '';

      for (const item of bundleValues) {
        if (item.type !== 'chunk') continue;
        // 1. 只有“用到样式”的入口才注入
        const hasStyleImport = Object.keys(item.modules).some(isStyleChunk);
        if (!hasStyleImport) continue;
        // 2. 根据 chunk 实际输出路径，算相对 CSS 路径
        const fromDir = path.posix.dirname(item.fileName);
        const relative = path.posix.relative(fromDir, injectedCss);
        const importPath = relative.startsWith('.')
          ? relative
          : `./${relative}`;
        item.code = `import "${importPath}";\n` + item.code;
      }
    },
  };
}

export default cssInjectPlugin;
