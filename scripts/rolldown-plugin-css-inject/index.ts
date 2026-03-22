import path from 'node:path';
import type { Plugin, OutputBundle } from 'rolldown';

export interface CSSInjectPluginOptions {
  /**
   * CSS 扩展名列表，需与 cssPlugin 处理的扩展名一致。
   * @default ['.css', '.scss', '.sass', '.less']
   */
  cssExtensions?: string[];
  /** @default 'es' */
  format?: 'es' | 'cjs';
}

const DEFAULT_CSS_EXTS = ['.css', '.scss', '.sass', '.less'];
const slash = (p: string) => p.replace(/\\/g, '/');

/**
 *
 * @param options
 */
export function cssInjectPlugin(options: CSSInjectPluginOptions = {}): Plugin {
  const { cssExtensions = DEFAULT_CSS_EXTS, format = 'es' } = options;

  const isCSSId = (id: string) =>
    cssExtensions.some((ext) => id.split('?')[0].toLowerCase().endsWith(ext));

  return {
    name: 'css-inject-plugin',

    generateBundle(_, bundle: OutputBundle) {
      // 建立 CSS asset 索引：baseName → CSS asset fileName
      // baseName = 去掉目录和 .css 后缀的文件名，例如 'components.Dzqt_Fdc'
      const cssAssetIndex = new Map<string, string>();
      for (const fileName of Object.keys(bundle)) {
        if (!fileName.endsWith('.css')) continue;
        const base = path.basename(fileName, '.css');
        cssAssetIndex.set(base, fileName);
      }
      if (cssAssetIndex.size === 0) return;

      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;

        const hasCSSModule = Object.keys(chunk.modules).some((id) =>
          isCSSId(id)
        );
        if (!hasCSSModule) continue;

        // 用 chunk 的 baseName 在 CSS asset 索引里查找对应的 CSS 文件。
        // cssPlugin 的命名规则保证两边 baseName 一致：
        //   entry chunk:     chunk.name
        //   非 entry chunk:  path.basename(chunk.fileName, ext)
        const jsBase =
          chunk.isEntry && chunk.name
            ? chunk.name
            : path.basename(chunk.fileName, path.extname(chunk.fileName));

        const cssFileName = cssAssetIndex.get(jsBase);
        if (!cssFileName) continue;

        const jsDir = path.dirname(chunk.fileName);
        const rel = slash(path.relative(jsDir, cssFileName));
        const importPath = rel.startsWith('.') ? rel : `./${rel}`;

        const importStmt =
          format === 'cjs'
            ? `require('${importPath}');\n`
            : `import '${importPath}';\n`;

        chunk.code = importStmt + chunk.code;
      }
    },
  };
}

export default cssInjectPlugin;
